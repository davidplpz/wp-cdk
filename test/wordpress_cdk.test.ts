import { Template } from "@aws-cdk/assertions";
import * as cdk from "@aws-cdk/core";
import * as WordpressCdk from "../lib/wordpress_cdk-stack";

test("Wordpress Stack", () => {
  const app = new cdk.App();
  const stack = new WordpressCdk.WordpressCdkStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::EC2::Instance", 1);
});
