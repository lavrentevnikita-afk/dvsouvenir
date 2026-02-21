import { IsInt, Min } from 'class-validator'

export class AssignManagerDto {
  @IsInt()
  @Min(1)
  managerId!: number
}
