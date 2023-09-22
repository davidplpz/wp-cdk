import * as ec2 from "@aws-cdk/aws-ec2"; // import ec2 library
import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import "dotenv/config";
import * as fs from "fs";

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_REGION,
  },
};
export class WordpressCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { ...props, env: config.env });

    const vpc = ec2.Vpc.fromLookup(this, process.env.VPC_NAME, {
      isDefault: true,
    });

    const role = new iam.Role(this, process.env.ROL_NAME, {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    const securityGroup = new ec2.SecurityGroup(
      this,
      process.env.SECURITY_ROL_NAME,
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

    const ec2Instance = new ec2.Instance(this, "simple-instance-1", {
      vpc: vpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: process.env.EC2_NAME,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: process.env.EC2_KEY,
    });

    const eip = new ec2.CfnEIP(this, process.env.SERVER_IP_NAME, {
      instanceId: ec2Instance.instanceId,
    });

    new ec2.CfnEIPAssociation(this, process.env.ELASTICA_IP_NAME, {
      eip: eip.ref,
      instanceId: ec2Instance.instanceId,
    });

    //TODO - Crear las claves para el acceso SSH

    //TODO - Generar script para montar el tinglado
    ec2Instance.addUserData(fs.readFileSync("lib/mount.sh", "utf8"));

    new cdk.CfnOutput(this, "simple-instance-1-output", {
      value: ec2Instance.instancePublicIp,
    });
  }
}
