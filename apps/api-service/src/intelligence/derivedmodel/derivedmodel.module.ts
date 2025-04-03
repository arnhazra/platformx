import { Module } from "@nestjs/common"
import { DerivedModelRepository } from "./derivedmodel.repository"
import { CqrsModule } from "@nestjs/cqrs"
import { EntityModule } from "@/shared/entity/entity.module"
import { DbConnectionMap } from "@/shared/utils/db-connection.map"
import { DerivedModel, DerivedModelSchema } from "./schemas/derivedmodel.schema"
import { CreateDerivedModelCommandHandler } from "./commands/handler/create-derived-model.handler"
import { FindAllDerivedModelsQueryHandler } from "./queries/handler/find-all-derived-models.handler"
import { FindOneDerivedModelQueryHandler } from "./queries/handler/find-one-derived-model.handler"
import { DerivedModelController } from "./derivedmodel.controller"
import { DerivedModelService } from "./derivedmodel.service"
import { FindFilterCategoriesQueryHandler } from "./queries/handler/find-filter-categories.handler"
import { FindMyBuildsQueryHandler } from "./queries/handler/find-my-builds.handler"
import { Dataset, DatasetSchema } from "./schemas/dataset.schema"
import { DatasetRepository } from "./dataset.repository"
import { FindDatasetQueryHandler } from "./queries/handler/find-dataset.handler"

@Module({
  imports: [
    CqrsModule,
    EntityModule.forFeature(
      [
        { name: DerivedModel.name, schema: DerivedModelSchema },
        { name: Dataset.name, schema: DatasetSchema },
      ],
      DbConnectionMap.Intelligence
    ),
  ],
  controllers: [DerivedModelController],
  providers: [
    DerivedModelService,
    DerivedModelRepository,
    DatasetRepository,
    CreateDerivedModelCommandHandler,
    FindAllDerivedModelsQueryHandler,
    FindOneDerivedModelQueryHandler,
    FindFilterCategoriesQueryHandler,
    FindMyBuildsQueryHandler,
    FindDatasetQueryHandler,
  ],
})
export class DerivedModelModule {}
