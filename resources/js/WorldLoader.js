importScripts('MapHelper.js');
importScripts('DataStream.js');

self.addEventListener('message', function(e) {
  self.start(e.data);
}, false);

var start = function (file) {
  var fileReader = new FileReaderSync();

  self.postMessage({ 'status': "Reading world file..."});
 
	var buffer = fileReader.readAsArrayBuffer(file);
	
	var ds = new DataStream(buffer);
	
	ds.endianness = DataStream.LITTLE_ENDIAN;
	
	var world = {};
	
	self.postMessage({ 'status': "Loading world file..." });

	readWorldFile(ds, world);
};

function readWorldFile(reader, world) {
  readFileFormatHeader(reader, world);
  readProperties(reader, world);
  readTiles(reader, world);
  readChests(reader, world);
  readSigns(reader, world);
  readNpcs(reader, world);
	
  self.postMessage( 
    {
      'status': "Done.",
      'done': true
    });
}

function readFileFormatHeader(reader, world) {
  self.postMessage( {'status': "Reading world version..."});
  
	world.version = reader.readInt32();

  self.postMessage(
    {
      'status': "Reading world header...",
      'version': world.version,
    });
	
	// read file metadata
	// TODO: implement readUint64()
	reader.readUint32();
	reader.readUint32();

	world.revision = reader.readUint32();

  // isFavorite
	reader.readUint32();
	reader.readUint32();

  // read positions
	var i = 0;

	var positionsLength = reader.readInt16();
	for (i = 0; i < positionsLength; i++) {
		reader.readInt32();
	}

  // read importances
	var importanceLength = reader.readInt16();
	world.importance = new Array(importanceLength);
	var b = 0;
	var b2 = 128;
	for (i = 0; i < importanceLength; i++) {
		if (b2 == 128) {
			b = reader.readUint8();
			b2 = 1;
		}
		else {
			b2 = b2 << 1;
		}

		if ((b & b2) == b2) {
			world.importance[i] = true;
		}
	}
}

function readProperties(reader, world) {
	world.name = readString(reader);

	world.id = reader.readInt32();

	world.left = reader.readInt32();
	world.right = reader.readInt32();
	world.top = reader.readInt32();
	world.bottom = reader.readInt32();

	world.height = reader.readInt32();
	world.width = reader.readInt32();

	world.expertMode = reader.readUint8() > 0;

	// creation time (Int64)
	reader.readInt32();
	reader.readInt32();

	world.moonType = reader.readUint8();

	world.treeTypeXCoordinates = reader.readInt32Array(3);
	world.treeStyles = reader.readInt32Array(4);
	world.caveBackXCoordinates = reader.readInt32Array(3);
	world.caveBackStyles = reader.readInt32Array(4);
	world.iceBackStyle = reader.readInt32();
	world.jungleBackStyle = reader.readInt32();
	world.hellBackStyle = reader.readInt32();

	world.spawnX = reader.readInt32();
	world.spawnY = reader.readInt32();

	world.worldSurfaceY = reader.readFloat64();
	world.rockLayerY = reader.readFloat64();
	world.gameTime = reader.readFloat64();
	world.isDay = reader.readUint8() > 0;
	world.moonPhase = reader.readInt32();
	world.bloodMoon = reader.readUint8() > 0;
	world.eclipse = reader.readUint8() > 0;
	world.dungeonX = reader.readInt32();
	world.dungeonY = reader.readInt32();
	world.crimsonWorld = reader.readUint8() > 0;
	world.killedEyeOfCthulu = reader.readUint8() > 0;
	world.killedEaterOfWorlds = reader.readUint8() > 0;
	world.killedSkeletron = reader.readUint8() > 0;
	world.killedQueenBee = reader.readUint8() > 0;
	world.killedTheDestroyer = reader.readUint8() > 0;
	world.killedTheTwins = reader.readUint8() > 0;
	world.killedSkeletronPrime = reader.readUint8() > 0;
	world.killedAnyHardmodeBoss = reader.readUint8() > 0;
	world.killedPlantera = reader.readUint8() > 0;
	world.killedGolem = reader.readUint8() > 0;
	world.killedSlimeKing = reader.readUint8() > 0;
	world.savedGoblinTinkerer = reader.readUint8() > 0;
	world.savedWizard = reader.readUint8() > 0;
	world.savedMechanic = reader.readUint8() > 0;
	world.defeatedGoblinInvasion = reader.readUint8() > 0;
	world.killedClown = reader.readUint8() > 0;
	world.defeatedFrostLegion = reader.readUint8() > 0;
	world.defeatedPirates = reader.readUint8() > 0;
	world.brokeAShadowOrb = reader.readUint8() > 0;
	world.meteorSpawned = reader.readUint8() > 0;
	world.shadowOrbsbrokenmod3 = reader.readUint8();
	world.altarsSmashed = reader.readInt32();
	world.hardMode = reader.readUint8() > 0;
	world.goblinInvasionDelay = reader.readInt32();
	world.goblinInvasionSize = reader.readInt32();
	world.goblinInvasionType = reader.readInt32();
	world.goblinInvasionX = reader.readFloat64();
	world.slimeRainTime = reader.readFloat64();
	world.sundialCooldown = reader.readUint8();
	world.isRaining = reader.readUint8() > 0;
	world.rainTime = reader.readInt32();
	world.maxRain = reader.readFloat32();
	world.tier1OreID = reader.readInt32();
	world.tier2OreID = reader.readInt32();
	world.tier3OreID = reader.readInt32();
	world.treeStyle = reader.readUint8();
	world.corruptionStyle = reader.readUint8();
	world.jungleStyle = reader.readUint8();
	world.snowStyle = reader.readUint8();
	world.hallowStyle = reader.readUint8();
	world.crimsonStyle = reader.readUint8();
	world.desertStyle = reader.readUint8();
	world.oceanStyle = reader.readUint8();
	world.cloudBackground = reader.readInt32();
	world.numberofClouds = reader.readInt16();
	world.windSpeed = reader.readFloat32();

	world.anglerWhoFinishedTodayCount = reader.readInt32();
	world.anglersWhoFinishedToday = [];

	for (i = world.anglerWhoFinishedTodayCount; i > 0; i--) {
		world.anglersWhoFinishedToday.push(readString(reader));
	}

	world.savedAngler = reader.readUint8() > 0;
	world.anglerQuest = reader.readInt32();
	world.savedStylist = reader.readUint8() > 0;
	world.savedTaxCollector = reader.readUint8() > 0;
	world.invasionSizeStart = reader.readInt32();
	world.tempCultistDelay = reader.readInt32();

	var num1 = reader.readInt16();
	for (var j = 0; j < num1; j++) {
		if (j < 540) {
			//this.NpcKillCount[j] = reader.ReadInt32();
			reader.readInt32();
		}
		else {
			reader.readInt32();
		}
	}

	world.fastForwardTime = reader.readUint8() > 0;
	world.downedFishron = reader.readUint8() > 0;
	world.downedMartians = reader.readUint8() > 0;
	world.downedAncientCultist = reader.readUint8() > 0;
	world.downedMoonlord = reader.readUint8() > 0;
	world.downedHalloweenKing = reader.readUint8() > 0;
	world.downedHalloweenTree = reader.readUint8() > 0;
	world.downedChristmasIceQueen = reader.readUint8() > 0;
	world.downedChristmasSantank = reader.readUint8() > 0;
	world.downedChristmasTree = reader.readUint8() > 0;
	world.downedTowerSolar = reader.readUint8() > 0;
	world.downedTowerVortex = reader.readUint8() > 0;
	world.downedTowerNebula = reader.readUint8() > 0;
	world.downedTowerStardust = reader.readUint8() > 0;
	world.towerActiveSolar = reader.readUint8() > 0;
	world.towerActiveVortex = reader.readUint8() > 0;
	world.towerActiveNebula = reader.readUint8() > 0;
	world.towerActiveStardust = reader.readUint8() > 0;
	world.lunarApocalypseIsUp = reader.readUint8() > 0;

	var hellLevel = ((world.height - 230) - world.worldSurfaceY) / 6;
	hellLevel = hellLevel * 6 + world.worldSurfaceY - 5;
	world.hellLayerY = hellLevel;
}

function readTiles(reader, world) {
  self.postMessage(
    {
      'status': "Reading world tiles...",
      'world': world,
    });
    
  // 	world.tiles = [world.width, world.height];
	world.totalTileCount = world.width * world.height;

	var tilesProcessed = 0;

  var color;
  var num2 = -1;
	var tile = {};
	var b3 = 0;
	var b4 = 0;
	var k = 0;
	var x = 0;
	var y = 0;
  
  // world.tiles = new Array(world.width);

	for (x = 0; x < world.width; x++) {
		// world.tiles[x] = new Array(world.height);

    var tiles = [];

		for (y = 0; y < world.height; y++) {
			num2 = -1;
			b2 = 0;
			b = 0;
			tile = {};
			b3 = reader.readUint8();
			if ((b3 & 1) == 1) {
				b2 = reader.readUint8();
				if ((b2 & 1) == 1) {
					b = reader.readUint8();
				}
			}
			b4 = 0;
			if ((b3 & 2) == 2) {
				tile.IsActive = true;
				if ((b3 & 32) == 32) {
					b4 = reader.readUint8();
					num2 = reader.readUint8();
					num2 = (num2 << 8 | b4);
				}
				else {
					num2 = reader.readUint8();
				}

				tile.Type = num2;

				if (world.importance[num2]) {
					tile.TextureU = reader.readInt16();
					tile.TextureV = reader.readInt16();
					if (tile.Type == 144) {
						tile.TextureV = 0;
					}
				}
				else {
					tile.TextureU = -1;
					tile.TextureV = -1;
				}
				if ((b & 8) == 8) {
				// 	tile.ColorValue = reader.readUint8();
				reader.readUint8();
				}
			}
			if ((b3 & 4) == 4) {
				tile.WallType = reader.readUint8();
				tile.IsWallPresent = true;
				if ((b & 16) == 16) {
					tile.WallColor = reader.readUint8();
					tile.IsWallColorPresent = true;
				}
			}
			b4 = (b3 & 24) >> 3;
			if (b4 !== 0) {
				tile.IsLiquidPresent = true;
				tile.LiquidAmount = reader.readUint8();
				if (b4 > 1) {
					if (b4 == 2) {
						tile.IsLiquidLava = true;
					}
					else {
						tile.IsLiquidHoney = true;
					}
				}
			}
			if (b2 > 1) {
				if ((b2 & 2) == 2) {
					tile.IsRedWirePresent = true;
				}
				if ((b2 & 4) == 4) {
					tile.IsGreenWirePresent = true;
				}
				if ((b2 & 8) == 8) {
					tile.IsBlueWirePresent = true;
				}
				b4 = (b2 & 112) >> 4;
			}
			if (b > 0) {
				if ((b & 2) == 2) {
					tile.IsActuatorPresent = true;
				}
				if ((b & 4) == 4) {
					tile.IsActive = false;
				}
			}
			b4 = (b3 & 192) >> 6;
			k = 0;
			if (b4 === 0) {
				k = 0;
			}
			else {
				if (b4 == 1) {
					k = reader.readUint8();
				}
				else {
					k = reader.readInt16();
				}
			}

      tiles.push(tile);
      
			while (k > 0) {
				y++;
				
  			tiles.push(tile);
  			
				k--;
			}
		}

		tilesProcessed += world.height;

    self.postMessage( 
      {
        'status': "Reading tile " + tilesProcessed + " of " + world.totalTileCount,
        // 'tilesProcessed': tilesProcessed,
        // 'totalTileCount': world.totalTileCount,
        'x': x,
        'tiles': tiles,
      });
	}
}

function readChests(reader, world) {
  var chests = [];
  
  var num = reader.readInt16();
  var num2 = reader.readInt16();
  var num3;
  var num4;
  
  var maxItems = 40;
  
  if(num2 < maxItems) {
    num3 = num2;
    num4 = 0;
  }
  else {
    num3 = maxItems;
    num4 = num2 - maxItems;
  }
  
  for(var i = 0; i < num; i++) {
    var chest = {};
    chest.items = [];
    chest.x = reader.readInt32();
    chest.y = reader.readInt32();
    chest.name = readString(reader);
    
    var j = 0;
    var num5 = 0;
    
    for(j = 0; j < num3; j++) {
      num5 = reader.readInt16();
      
      if(num5 > 0) {
        var item = {};
        item.id = reader.readInt32();
        item.count = num5;
        item.prefixId = reader.readUint8();
        chest.items.push(item);
      }
    }
    
    for(j = 0; j < num4; j++) {
      num5 = reader.readInt16();
      if(num5 > 0) {
        reader.readInt32();
        reader.readUint8();
      }
    }
    
    chests.push(chest);
  }
  
  self.postMessage( 
  {
    'chests': chests,
  });
}

function readSigns(reader, world) {
  var signs = [];
  
  var num = reader.readInt16();
  
  for(var i = 0; i < num; i++) {
    var sign = {};
    
    sign.text = readString(reader);
    sign.x = reader.readInt32();
    sign.y = reader.readInt32();
    
    signs.push(sign);
  }
  
  self.postMessage( 
    {
      'signs': signs,
    });
}

function readNpcs(reader, world) {
  var npcs = [];
  
  var num = 0;
  var flag = reader.readUint8() > 0;
  
  var npc;
  
  while(flag) {
    npc = {};
    npc.type = readString(reader);
    npc.name = readString(reader);
    npc.x = reader.readFloat32() / 16;
    npc.y = reader.readFloat32() / 16;
    npc.isHomeless = reader.readUint8() > 0;
    npc.homeX = reader.readInt32();
    npc.homeY = reader.readInt32();
    npcs.push(npc);
    
    num++;
    flag = reader.readUint8() > 0;
  }
  
  flag = reader.readUint8() > 0;
  while(flag) {
    npc = {};
    npc.type = readString(reader);
    npc.x = reader.readFloat32();
    npc.y = reader.readFloat32();
    num++;
    flag = reader.readUint8();
  }
  
  self.postMessage( 
    {
      'npcs': npcs,
    });
}

function readString(reader) {
	var stringLength = 0;
	var stringLengthParsed = false;
	var step = 0;
	while (!stringLengthParsed) {
		var part = reader.readUint8();
		stringLengthParsed = ((part >> 7) === 0);
		var partCutter = part & 127;
		part = partCutter;
		var toAdd = part << (step * 7);
		stringLength += toAdd;
		step++;
	}

	return reader.readString(stringLength);
}