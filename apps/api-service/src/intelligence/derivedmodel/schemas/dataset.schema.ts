import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"
import { DerivedModel } from "./derivedmodel.schema"

@Schema({ versionKey: false, collection: "datasets" })
export class Dataset extends Document {
  @Prop({ type: Types.ObjectId, ref: DerivedModel.name, required: true })
  derivedModel: Types.ObjectId

  @Prop({ required: true })
  data: Record<string, any>[]
}

export const DatasetSchema = SchemaFactory.createForClass(Dataset)
