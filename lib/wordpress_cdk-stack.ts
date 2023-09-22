import * as ec2 from "@aws-cdk/aws-ec2"; // import ec2 library
import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import "dotenv/config";
import * as fs from "fs";

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_REGION,
  },
};
export class WordpressCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { ...props, env: config.env });

    const vpc = new ec2.Vpc(this, process.env.VPC_NAME || "VPC", {});

    const role = new iam.Role(this, process.env.ROL_NAME || "ROLE", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    const securityGroup = new ec2.SecurityGroup(
      this,
      process.env.SECURITY_ROL_NAME || "SecurityGroup",
      {
        vpc: vpc,
        allowAllOutbound: true,
        securityGroupName: "simple-instance-1-sg",
      }
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allows SSH access from Internet"
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allows HTTP access from Internet"
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allows HTTPS access from Internet"
    );

    const image = ec2.MachineImage.genericLinux({
      "eu-west-1": "ami-0694d931cee176e7d",
    });

    const keyProps: ec2.CfnKeyPairProps = {
      keyName: process.env.EC2_KEY || "key",
      publicKeyMaterial: "publicKeyMaterial",
    };
    const keypair = new ec2.CfnKeyPair(
      this,
      process.env.EC2_KEY || "Key Pair",
      keyProps
    );

    const ec2Instance = new ec2.Instance(
      this,
      process.env.EC2_NAME || "Ec2Instance",
      {
        vpc: vpc,
        role: role,
        securityGroup: securityGroup,
        instanceName: process.env.EC2_NAME,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        machineImage: image,
        keyName: keypair.keyName,
      }
    );

    const eip = new ec2.CfnEIP(this, process.env.SERVER_IP_NAME || "EIP", {
      instanceId: ec2Instance.instanceId,
    });

    new ec2.CfnEIPAssociation(
      this,
      process.env.ELASTICA_IP_NAME || "ElasticaIP",
      {
        eip: eip.ref,
        instanceId: ec2Instance.instanceId,
      }
    );

    //TODO - Crear las claves para el acceso SSH

    ec2Instance.addUserData(fs.readFileSync("lib/mount.sh", "utf8"));

    new cdk.CfnOutput(this, "simple-instance-1-output", {
      value: ec2Instance.instancePublicIp,
    });
  }
}
