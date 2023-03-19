import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  /**
   * @param body
   */
  constructor(body: any = {}) {
    super(body);
    this.name = body.name;
  }
}
