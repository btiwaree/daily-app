import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    id?: string;
  };
}

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: RequestWithUser): Promise<string> {
    // If user is authenticated, use user ID for rate limiting
    if (req.user?.id) {
      return req.user.id;
    }
    // Fall back to IP address for unauthenticated requests
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }
}
