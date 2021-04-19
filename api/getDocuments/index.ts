import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import S3 from 'aws-sdk/clients/s3';

const bucketName = process.env.DOCUMENTS_BUCKET_NAME;
const s3 = new S3();

export const getDocuments = async (event:APIGatewayProxyEventV2, context: Context) 
    : Promise<APIGatewayProxyStructuredResultV2> => {
    
        console.log(`Bucket Name: ${bucketName}`)
    
        try {
            const { Contents: results } = await s3.listObjects({Bucket: bucketName!}).promise();
            const documents = await Promise.all(results!.map(async r => generateSignedUrl(r)));
            
            return {
                statusCode: 200,
                body: JSON.stringify(documents)
            }
        } catch (error) {
            return {
                statusCode: 500,
                body: error.message
            }
        }
        
}

const generateSignedUrl = async (object: S3.Object): Promise<{filename: string, url: string}> => {
    const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: bucketName,
        Key: object.Key!,
        Expires: (60*60) // hour
    });

    return {
        filename: object.Key!,
        url: url
    };
}