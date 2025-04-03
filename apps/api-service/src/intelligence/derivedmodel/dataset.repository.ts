import { Injectable } from "@nestjs/common"
import { InjectConnection, InjectModel } from "@nestjs/mongoose"
import { DbConnectionMap } from "src/shared/utils/db-connection.map"
import { DerivedModel } from "./schemas/derivedmodel.schema"
import { Connection, Model, Types } from "mongoose"
import { EntityRepository } from "@/shared/entity/entity.repository"
import { User } from "@/core/user/schemas/user.schema"
import { Dataset } from "./schemas/dataset.schema"

@Injectable()
export class DatasetRepository extends EntityRepository<Dataset> {
  constructor(
    @InjectModel(Dataset.name, DbConnectionMap.Intelligence)
    private datasetModel: Model<Dataset>
  ) {
    super(datasetModel)
  }
}
