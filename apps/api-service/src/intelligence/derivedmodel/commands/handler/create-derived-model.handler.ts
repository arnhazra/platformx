import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { CreateDerivedModelCommand } from "../impl/create-derived-model.command"
import { DerivedModelRepository } from "../../derivedmodel.repository"
import objectId from "@/shared/utils/convert-objectid"
import { DatasetRepository } from "../../dataset.repository"

@CommandHandler(CreateDerivedModelCommand)
export class CreateDerivedModelCommandHandler
  implements ICommandHandler<CreateDerivedModelCommand>
{
  constructor(
    private readonly repository: DerivedModelRepository,
    private readonly datasetRepository: DatasetRepository
  ) {}

  async execute(command: CreateDerivedModelCommand) {
    const {
      baseModel,
      category,
      description,
      systemPrompt,
      displayName,
      isPublic,
      dataset,
    } = command.createDerivedModelDto
    const derivedModel = await this.repository.create({
      baseModel: objectId(baseModel),
      category,
      description,
      systemPrompt,
      displayName,
      modelOwner: objectId(command.userId),
      isPublic,
    })
    await this.datasetRepository.create({
      derivedModel: objectId(derivedModel._id as string),
      data: dataset,
    })
    return derivedModel
  }
}
