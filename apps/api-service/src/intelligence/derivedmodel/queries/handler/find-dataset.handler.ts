import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindDatasetQuery } from "../impl/find-dataset.query"
import { DatasetRepository } from "../../dataset.repository"
import { Dataset } from "../../schemas/dataset.schema"
import objectId from "@/shared/utils/convert-objectid"

@QueryHandler(FindDatasetQuery)
export class FindDatasetQueryHandler
  implements IQueryHandler<FindDatasetQuery>
{
  constructor(private readonly datasetRepository: DatasetRepository) {}

  async execute(query: FindDatasetQuery): Promise<Dataset | null> {
    const { datasetId } = query
    return this.datasetRepository.findOne({ derivedModel: objectId(datasetId) })
  }
}
