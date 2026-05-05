import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { AgentResponse } from '@/types/agent';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Run graphify query command
    const { stdout, stderr } = await execAsync(`graphify query "${query.replace(/"/g, '\\"')}"`, {
      cwd: process.cwd(),
    });

    if (stderr) {
      console.error('Graphify stderr:', stderr);
    }

    return NextResponse.json<AgentResponse>({ result: stdout });
  } catch (error) {
    console.error('Error running graphify query:', error);
    return NextResponse.json<AgentResponse>({ result: '', error: 'Failed to query graph' }, { status: 500 });
  }
}