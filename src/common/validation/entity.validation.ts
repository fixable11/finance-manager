import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { Buffer } from 'buffer';
import { ObjectId, ObjectIdLike } from 'bson';

export function validateId(
  id: string | number | ObjectId | ObjectIdLike | Buffer | Uint8Array,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid id is given');
  }
}
