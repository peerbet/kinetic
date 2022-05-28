import { Field, Int, ObjectType } from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'
import { GraphQLJSON } from 'graphql-type-json'
import { AppTransactionError } from './app-transaction-error.entity'
import { AppTransactionStatus } from './app-transaction-status.enum'

@ObjectType()
export class AppTransaction {
  @ApiProperty()
  @Field({ nullable: true })
  id?: string
  @ApiProperty()
  @Field({ nullable: true })
  createdAt?: Date
  @ApiProperty()
  @Field({ nullable: true })
  updatedAt?: Date
  @ApiProperty()
  @Field(() => Int, { nullable: true })
  amount?: number
  @ApiProperty()
  @Field({ nullable: true })
  destination?: string
  @ApiProperty({
    type: [AppTransactionError],
  })
  @Field(() => [AppTransactionError], { nullable: true })
  errors?: AppTransactionError[]
  @ApiProperty()
  @Field({ nullable: true })
  feePayer?: string
  @ApiProperty()
  @Field({ nullable: true })
  mint?: string
  @ApiProperty()
  @Field({ nullable: true })
  signature?: string
  @ApiProperty()
  @Field({ nullable: true })
  solanaFinalized?: Date
  @ApiProperty()
  @Field({ nullable: true })
  solanaEnd?: Date
  @ApiProperty()
  @Field({ nullable: true })
  solanaStart?: Date
  @ApiProperty()
  @Field(() => GraphQLJSON, { nullable: true })
  solanaTransaction?: any
  @ApiProperty()
  @Field({ nullable: true })
  source?: string
  @ApiProperty()
  @Field(() => AppTransactionStatus)
  status: AppTransactionStatus
  @ApiProperty()
  @Field({ nullable: true })
  webhookEventStart?: Date
  @ApiProperty()
  @Field({ nullable: true })
  webhookEventEnd?: Date
  @ApiProperty()
  @Field({ nullable: true })
  webhookVerifyStart?: Date
  @ApiProperty()
  @Field({ nullable: true })
  webhookVerifyEnd?: Date
}