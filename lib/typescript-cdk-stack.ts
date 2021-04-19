import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { Tags } from '@aws-cdk/core';
import { DocumentManagementAPI } from './api';
import {Networking} from './networking';
import { DocumentManagementWebServer } from './webserver';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as path from 'path';

export class TypescriptCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const bucket = new Bucket(this, 'DocumentsBucket', {
      encryption: BucketEncryption.S3_MANAGED
    });

    new s3Deploy.BucketDeployment(this, "DocumentsDeployment", {
      sources: [
        s3Deploy.Source.asset(path.join(__dirname, '..', 'documents'))
      ],
      destinationBucket: bucket,
      memoryLimit: 512
    });

    new cdk.CfnOutput(this, 'DocumentsBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'DocumentsBucketName'
    })

    const networkingStack = new Networking(this, 'NetworkingConstruct', {
      maxAzs: 2
    });

    Tags.of(networkingStack).add('Module', 'Networking');

    const api = new DocumentManagementAPI(this, 'DocumentManagementAPI', {
      documentBucket: bucket
    });

    Tags.of(api).add("Module", 'API');

    const webserver = new DocumentManagementWebServer(this, 'DocumentManagementWebserver', {
      vpc: networkingStack.vpc,
      api: api.httpApi
    });

    Tags.of(webserver).add('Module', 'Webserver');
  }
}
