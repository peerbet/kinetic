import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsUrl } from 'class-validator'

@InputType()
export class AppUpdateInput {
  @Field({ nullable: true })
  name?: string
  @IsOptional()
  @Field({ nullable: true })
  webhookAcceptIncoming?: boolean
  @IsOptional()
  @Field({ nullable: true })
  webhookEventEnabled?: boolean
  @IsOptional()
  @IsUrl({}, { message: 'webhookEventUrl must be a url' })
  @Field({ nullable: true })
  webhookEventUrl?: string
  @Field({ nullable: true })
  webhookSecret?: string
  @IsOptional()
  @Field({ nullable: true })
  webhookVerifyEnabled?: boolean
  @IsOptional()
  @IsUrl(undefined, { message: 'webhookVerifyUrl must be a url' })
  @Field({ nullable: true })
  webhookVerifyUrl?: string
}
