import { NextResponse } from "next/server"

export function GET() {
  // Return instructions for setting up Socket.io
  return NextResponse.json({
    message: "This is the Socket.io endpoint. You need to connect using a Socket.io client.",
  })
}

