import { Module } from "@nestjs/common"
import { BaseModelModule } from "./basemodel/basemodel.module"
import { FavouritesModule } from "./favourites/favourites.module"
import { ChatModule } from "./chat/chat.module"
import { config } from "@/config"
import { EntityModule } from "@/shared/entity/entity.module"
import { DbConnectionMap } from "@/shared/utils/db-connection.map"
import { DerivedModelModule } from "./derivedmodel/derivedmodel.module"
import { HistoryModule } from "./history/history.module"
import { DatamarketplaceModule } from "./datamarketplace/datamarketplace.module"

@Module({
  imports: [
    EntityModule.forRoot(
      config.CORE_DATABASE_URI,
      DbConnectionMap.Intelligence
    ),
    BaseModelModule,
    DerivedModelModule,
    ChatModule,
    FavouritesModule,
    HistoryModule,
    DatamarketplaceModule,
  ],
})
export class IntelligenceModule {}
