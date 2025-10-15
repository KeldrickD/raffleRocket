import { NextRequest, NextResponse } from 'next/server';
import { BatchOperationType } from '@/types/nft';

interface BatchOperationRequest {
  operation: BatchOperationType;
  mints: string[];
  params?: {
    recipient?: string;        // For transfer operation
    price?: number;            // For list operation
    ticketPrice?: number;      // For raffle operation
    duration?: number;         // For raffle operation
  };
}

interface BatchOperationResponse {
  success: boolean;
  operation: BatchOperationType;
  processed: string[];
  failed?: string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data: BatchOperationRequest = await request.json();
    
    // Validate the request
    if (!data.operation) {
      return NextResponse.json(
        { error: 'Missing operation type' }, 
        { status: 400 }
      );
    }
    
    if (!data.mints || !Array.isArray(data.mints) || data.mints.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid mints array' }, 
        { status: 400 }
      );
    }
    
    // Simulate processing time based on the number of NFTs
    const processingTime = 100 * data.mints.length;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate success with occasional random failures
    const response: BatchOperationResponse = {
      success: true,
      operation: data.operation,
      processed: [],
    };
    
    // Process each mint
    for (const mint of data.mints) {
      // Simulate a 5% chance of failure
      if (Math.random() > 0.95) {
        response.failed = response.failed || [];
        response.failed.push(mint);
      } else {
        response.processed.push(mint);
      }
    }
    
    // Set success to false if any operations failed
    if (response.failed && response.failed.length > 0) {
      response.success = false;
      response.error = `Failed to process ${response.failed.length} NFTs`;
    }
    
    // Add operation specific details to the response
    let operationMessage = '';
    switch (data.operation) {
      case 'transfer':
        operationMessage = `Transferred ${response.processed.length} NFTs to ${data.params?.recipient || 'recipient'}`;
        break;
        
      case 'list':
        operationMessage = `Listed ${response.processed.length} NFTs for sale at ${data.params?.price || '0'} SOL each`;
        break;
        
      case 'delist':
        operationMessage = `Delisted ${response.processed.length} NFTs from marketplace`;
        break;
        
      case 'raffle':
        operationMessage = `Created raffle for ${response.processed.length} NFTs with ticket price of ${data.params?.ticketPrice || '0'} SOL, lasting ${data.params?.duration || '0'} days`;
        break;
        
      case 'burn':
        operationMessage = `Burned ${response.processed.length} NFTs permanently`;
        break;
    }
    
    return NextResponse.json({
      ...response,
      message: operationMessage,
    });
  } catch (error) {
    console.error('Error processing batch operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 