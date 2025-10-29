import { processScheduledEmails } from '@/libs/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Starting scheduled email processing...');

    const result = await processScheduledEmails();

    console.log('Scheduled email processing completed:', {
      processed: result.processed,
      errors: result.errors.length,
    });

    return Response.json({
      success: true,
      message: 'Scheduled emails processed successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return Response.json(
      {
        error: 'Failed to process scheduled emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
