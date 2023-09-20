#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "dotenv/config";
import "source-map-support/register";
import { WordpressCdkStack } from "../lib/wordpress_cdk-stack";

const app = new cdk.App();
new WordpressCdkStack(app, "WordpressCdkStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
