import {
  Controller,
  Post,
  Body,
  Get,
  BadRequestException,
  UseGuards,
  Param,
} from "@nestjs/common"
import { DatamarketplaceService } from "./datamarketplace.service"
import { FindDatasetsDto } from "./dto/find-datasets.dto"
import { TokenGuard } from "src/shared/auth/token.guard"
import { APIKeyGuard } from "@/shared/auth/apikey.guard"
import { sortOptions } from "./data/dataset-sort-options"

@Controller("datamarketplace")
export class DatamarketplaceController {
  constructor(
    private readonly datamarketplaceService: DatamarketplaceService
  ) {}

  @UseGuards(TokenGuard)
  @Get("filters-and-sort-options")
  async getDatasetFiltersAndSortOptions() {
    try {
      const filters = await this.datamarketplaceService.getDatasetFilters()
      return { filters, sortOptions }
    } catch (error) {
      throw new BadRequestException()
    }
  }

  @UseGuards(TokenGuard)
  @Post("listings")
  async findDatasets(@Body() findDatasetsDto: FindDatasetsDto) {
    try {
      return await this.datamarketplaceService.findDatasets(findDatasetsDto)
    } catch (error) {
      throw new BadRequestException()
    }
  }

  @UseGuards(TokenGuard)
  @Get("viewdataset/:datasetId")
  async viewDataset(@Param() params: any) {
    try {
      return await this.datamarketplaceService.viewDataset(params.datasetId)
    } catch (error) {
      throw new BadRequestException()
    }
  }

  @UseGuards(APIKeyGuard)
  @Get("dataapi/:datasetId")
  async getData(@Param() params: any) {
    try {
      return await this.datamarketplaceService.getData(params.datasetId)
    } catch (error) {
      throw new BadRequestException()
    }
  }
}
