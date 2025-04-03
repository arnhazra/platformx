import { IsNotEmpty } from "class-validator"

export class CreateDerivedModelDto {
  @IsNotEmpty()
  readonly displayName: string

  @IsNotEmpty()
  readonly description: string

  @IsNotEmpty()
  readonly category: string

  @IsNotEmpty()
  readonly baseModel: string

  @IsNotEmpty()
  readonly isPublic: boolean

  @IsNotEmpty()
  readonly dataset: Record<string, any>[]
}
