import { processReengageEmails } from '@/libs/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Starting re-engagement email processing...');

    const result = await processReengageEmails();

    console.log('Re-engagement email processing completed:', {
      processed: result.processed,
      sent: result.sent,
      skipped: result.skipped,
      errors: result.errors.length,
    });

    return Response.json({
      success: true,
      message: 'Re-engagement emails processed successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error processing re-engagement emails:', error);
    return Response.json(
      {
        error: 'Failed to process re-engagement emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
