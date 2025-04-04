import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { CreateThreadCommand } from "./commands/impl/create-thread.command"
import { Thread } from "./schemas/thread.schema"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { EventsUnion } from "@/shared/utils/events.union"
import { AIGenerationDto } from "./dto/ai-generate.dto"
import { Types } from "mongoose"
import { FetchThreadByIdQuery } from "./queries/impl/fetch-thread-by-id.query"
import { DerivedModelResponseDto } from "../derivedmodel/dto/response/derived-model.response.dto"
import GeminiStrategy from "./strategies/gemini.strategy"
import GroqStrategy from "./strategies/groq.strategy"
import OpenAIStrategy from "./strategies/openai.strategy"
import { GetUsageByUserIdQuery } from "./queries/impl/get-usage-by-user-id.query"
import { statusMessages } from "@/shared/constants/status-messages"
import { HttpService } from "@nestjs/axios"

@Injectable()
export class ChatService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventEmitter: EventEmitter2,
    private readonly httpService: HttpService
  ) {}

  async getModelById(modelId: string) {
    try {
      const modelResponse: DerivedModelResponseDto[] =
        await this.eventEmitter.emitAsync(
          EventsUnion.GetDerivedModelDetails,
          modelId
        )

      if (modelResponse && modelResponse.length && modelResponse[0] !== null) {
        return modelResponse.shift()
      } else {
        throw new BadRequestException("Model not found")
      }
    } catch (error) {
      throw error
    }
  }

  async getDatasetById(datasetId: string) {
    try {
      const dataset = await this.eventEmitter.emitAsync(
        EventsUnion.GetDataset,
        datasetId
      )

      if (dataset && dataset.length && dataset[0] !== null) {
        return dataset.shift()
      } else {
        throw new BadRequestException("Model not found")
      }
    } catch (error) {
      throw error
    }
  }

  async getThreadById(threadId: string, isFirstMessage: boolean) {
    try {
      if (isFirstMessage) {
        return []
      }

      const thread = await this.queryBus.execute<
        FetchThreadByIdQuery,
        Thread[]
      >(new FetchThreadByIdQuery(threadId))
      if (!!thread && thread.length) {
        return thread
      } else {
        throw new BadRequestException("Thread not found")
      }
    } catch (error) {
      throw error
    }
  }

  @OnEvent(EventsUnion.GetThreadCount)
  async getTodaysUsageByUserId(userId: string) {
    try {
      return await this.queryBus.execute<GetUsageByUserIdQuery, number>(
        new GetUsageByUserIdQuery(userId)
      )
    } catch (error) {
      throw error
    }
  }

  cleanSearchResult(result: Record<string, any>): Record<string, any> {
    const cleanedData = result?.items?.map(
      (item: any) => item?.title + item?.snippet
    )
    return cleanedData
  }

  async generateRecommendation(
    aiGenerationDto: AIGenerationDto,
    userId: string,
    isSubscriptionActive: boolean
  ) {
    try {
      const { modelId, prompt, temperature, topP } = aiGenerationDto
      const threadId =
        aiGenerationDto.threadId ?? new Types.ObjectId().toString()
      const thread = await this.getThreadById(
        threadId,
        !aiGenerationDto.threadId
      )
      const gModel = await this.getModelById(modelId)
      const dataset = await this.getDatasetById(modelId)
      const dataToBeSearched = dataset?.data[0] ?? null

      if (gModel.baseModel.isPro && !isSubscriptionActive) {
        throw new ForbiddenException(statusMessages.subscriptionNotFound)
      }

      const systemPrompt = `This is a dataset, users will ask questions based on this dataset. 
        You are a helpful assistant. Please answer the questions based on the dataset.
        If you don't know the answer, please say 'I don't know'.
        If the question is not related to the dataset, please say 'I don't know'.
        If the question is not clear, please ask for clarification.
        If the question is too complex, please ask for clarification.
        The details of the dataset is below: ${JSON.stringify(gModel)}. "The data schema looks like this: " +
        ${JSON.stringify(dataToBeSearched)}`

      if (gModel.baseModel.genericName.includes("gemini")) {
        const { response } = await GeminiStrategy(
          gModel.baseModel.genericName,
          temperature ?? gModel.baseModel.defaultTemperature,
          topP ?? gModel.baseModel.defaultTopP,
          thread,
          prompt,
          systemPrompt
        )
        await this.commandBus.execute<CreateThreadCommand, Thread>(
          new CreateThreadCommand(userId, threadId, prompt, response)
        )
        return { response, threadId }
      } else if (gModel.baseModel.genericName.includes("gpt")) {
        const { response } = await OpenAIStrategy(
          gModel.baseModel.genericName,
          temperature ?? gModel.baseModel.defaultTemperature,
          topP ?? gModel.baseModel.defaultTopP,
          thread,
          prompt,
          systemPrompt
        )
        await this.commandBus.execute<CreateThreadCommand, Thread>(
          new CreateThreadCommand(userId, threadId, prompt, response)
        )
        return { response, threadId }
      } else {
        const { response } = await GroqStrategy(
          gModel.baseModel.genericName,
          temperature ?? gModel.baseModel.defaultTemperature,
          topP ?? gModel.baseModel.defaultTopP,
          thread,
          prompt,
          systemPrompt
        )
        await this.commandBus.execute<CreateThreadCommand, Thread>(
          new CreateThreadCommand(userId, threadId, prompt, response)
        )
        return { response, threadId }
      }
    } catch (error) {
      throw error
    }
  }
}
