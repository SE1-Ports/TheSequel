601
%{
#include "StdH.h"
#include "Models/Effects/Teleport01/Teleport.h"
#include "Models/Effects/ExplosionGrenade/ExplosionGrenade.h"
#include "Models/Effects/ShockWave01/ShockWave.h"
#include "Models/Effects/BloodOnTheWall01/Blood.h"
#include "EntitiesMP/MovingBrush.h"

#define EXPLOSION_GRENADE_TEXTURE_ANIM_FAST 0
#define EXPLOSION_GRENADE_TEXTURE_ANIM_MEDIUM 1
#define EXPLOSION_GRENADE_TEXTURE_ANIM_SLOW 2

#define SHOCKWAVE_TEXTURE_ANIM_FAST 0
#define SHOCKWAVE_TEXTURE_ANIM_MEDIUM 1
#define SHOCKWAVE_TEXTURE_ANIM_SLOW 2
%}

uses "EntitiesMP/Light";

enum BasicEffectType {
  0 BET_NONE                 "None",     // no effect (never spawned)
  1 BET_ROCKET               "Rocket",     // rocket explosion
  2 BET_ROCKET_PLANE         "Rocket plane",     // rocket explosion on plane
  3 BET_GRENADE              "Grenade",     // grenade explosion
  4 BET_GRENADE_PLANE        "Grenade plane",     // grenade explosion on plane
  5 BET_EXPLOSIONSTAIN       "Explosionstain",     // explosion stain on brush
  6 BET_SHOCKWAVE            "Shockwave",     // shock wave
  7 BET_LASERWAVE            "Laserwave",     // laser wave
 10 BET_BLOODSPILL           "Blood spill",     // blood spill from bullet exit wound
 11 BET_BLOODSTAIN           "Blood stain",     // blood stain
 19 BET_BLOODSTAINGROW       "Blood staingrow",     // blood stain which grows bigger
 12 BET_BLOODEXPLODE         "Blood explode",     // blood explosion at bullet entry wound 
 13 BET_CANNON               "Cannon",     // cannon explosion
 14 BET_CANNON_PLANE         "Cannon plane",     // cannon explosion on plane
 15 BET_CANNONEXPLOSIONSTAIN "Cannon explosion stain",     // cannon explosion stain on brush
 16 BET_CANNONSHOCKWAVE      "Cannon shockwave",     // cannon shock wave
 17 BET_TELEPORT             "Teleport",     // teleportation
 18 BET_BOMB                 "Bomb",     // small bomb explosion
 20 BET_BULLETTRAIL          "Bullet trail",     // white trail where bullet has passed
 21 BET_GIZMO_SPLASH_FX      "Gizmo splash fx",     // gizmo splash fx
 22 BET_GIZMOSTAIN           "Gizmo stain",     // gizmo stain
 30 BET_BULLETSTAINSTONE     "Bullet stain stone",     // bullet stain with ricochet on stone
 31 BET_BULLETSTAINSAND      "Bullet stain sand",     // bullet stain with ricochet on sand
 32 BET_BULLETSTAINWATER     "Bullet stain water",     // bullet stain with ricochet on water surface
 33 BET_BULLETSTAINUNDERWATER "Bullet stain underwater",    // bullet stain with ricochet on underwater surface
 34 BET_BULLETSTAINSTONENOSOUND "Bullet stain stonenosound",  // bullet stain on stone with no sound
 35 BET_BULLETSTAINSANDNOSOUND  "Bullet stain sandnosound",  // bullet stain on sand with no sound
 36 BET_BULLETSTAINWATERNOSOUND "Bullet stain waternosound",  // bullet stain on water surface with no sound
 37 BET_BULLETSTAINUNDERWATERNOSOUND "Bullet stain underwater no sound", // bullet stain on under water surface with no sound
 38 BET_BULLETSTAINREDSAND      "Bullet stain red sand",     // bullet stain with ricochet on red sand
 39 BET_BULLETSTAINREDSANDNOSOUND "Bullet stain red sand no sound",   // bullet stain with ricochet on red sand without sound
 40 BET_LIGHT_CANNON            "Light cannon",     // cannon explosion with lo sound volume
 41 BET_CANNON_NOLIGHT          "Cannon no light",     // cannon explosion without light witn lo sound volume
 42 BET_BULLETSTAINGRASS        "Bullet stain grass",     // bullet stain with ricochet on grass
 43 BET_BULLETSTAINWOOD         "Bullet stain wood",     // bullet stain with ricochet on wood
 44 BET_BULLETSTAINGRASSNOSOUND "Bullet stain grass no sound",     // bullet stain on grass with no sound
 45 BET_BULLETSTAINWOODNOSOUND  "Bullet stain wood no sound",     // bullet stain on wood with no sound
 46 BET_EXPLOSION_DEBRIS        "Explosion debris",     // debrises flying out of explosion
 47 BET_EXPLOSION_SMOKE         "Explosion smoke",     // smoke left behind explosion
 48 BET_SUMMONERSTAREXPLOSION   "Summoner star explosion",     // magic explosion of starts for summoner
 49 BET_COLLECT_ENERGY          "Collect energy",
 50 BET_GROWING_SWIRL           "Growing swirl",
// 51 BET_SNIPER_RESIDUE          "Sniper Residue",		// smoke left after firing sniper
 52 BET_DISAPPEAR_DUST          "Disappear dust",
 53 BET_DUST_FALL               "Dust fall",
 54 BET_BULLETSTAINSNOW         "Bullet stain snow", 
 55 BET_BULLETSTAINSNOWNOSOUND  "Bullet stain snow", 

 60 BET_PLASMA_EXPLOSION            "Plasma explosion",     // cannon explosion with lo sound volume
 61 BET_FLESH_SPLAT_FX              "Flesh splash fx",     // flesh splash fx
 62 BET_BONE_SPLAT_FX               "Bone splash fx",     // bone splash fx
 63 BET_SPIDER_SPLAT_FX               "Spider splash fx",     // spider splash fx
 64 BET_FLOATER_SPLAT_FX               "Floater splash fx",     // fliter splash fx
 65 BET_ARROWHIT                   "Arrow hit",     // Arrow hit
 66 BET_GOOSTAIN               "Goo stain",     // gizmo stain
 67 BET_BULLETSTAINLAVA         "Bullet stain lava", 
 68 BET_BULLETSTAINLAVANOSOUND  "Bullet stain lava",
 69 BET_BULLETSTAINACID         "Bullet stain acid",     // bullet stain with ricochet on water surface 
 70 BET_BULLETSTAINACIDNOSOUND  "Bullet stain acidnosound",  // bullet stain on water surface with no sound
 71 BET_BULLETSTAINGLASS         "Bullet stain glass",     // bullet stain with ricochet on water surface 
 72 BET_BULLETSTAINGLASSNOSOUND  "Bullet stain glassnosound",  // bullet stain on water surface with no sound
 73 BET_BULLETSTAINFLESH         "Bullet stain flesh",     // bullet stain with ricochet on water surface 
 74 BET_BULLETSTAINFLESHNOSOUND  "Bullet stain fleshnosound",  // bullet stain on water surface with no sound
 75 BET_BULLETSTAINMETAL         "Bullet stain metal",     // bullet stain with ricochet on water surface 
 76 BET_BULLETSTAINMETALNOSOUND  "Bullet stain metalnosound",  // bullet stain on water surface with no sound
 77 BET_BULLETSTAINENERGY         "Bullet stain energy",     // bullet stain with ricochet on water surface 
 78 BET_BULLETSTAINENERGYNOSOUND  "Bullet stain energynosound",  // bullet stain on water surface with no sound
 79 BET_HYDROGUN                  "Hydro explosion",     // cannon explosion with lo sound volume
 80 BET_TELEPORT_REVERSE          "Teleport reverse",     // teleportation in reverse
 81 BET_GASCLOUD                  "Gas cloud",            // gas cloud
 82 BET_T3DGMX                    "T3DGM Explosion",     // space explosion
 83 BET_HIVEBRAIN                 "HiveBrain Explosion",     // HiveBrain explosion
 91 BET_MANTAMAN                  "Mantaman attack",
 
 84 BET_HAMMER_FLESH              "Hammer hit flesh",
 85 BET_HAMMER_METAL              "Hammer hit metal",
 86 BET_HAMMER_ROCK               "Hammer hit rock",
 87 BET_HAMMER_WOOD               "Hammer hit wood",
 90 BET_HAMMER_GENERIC            "Hammer hit generic",
 88 BET_SAW                       "Saw scrape",
 89 BET_SAW_FLESH                 "Saw on flesh",
};


// input parameter for spwaning a basic effect
event ESpawnEffect {
  enum BasicEffectType betType,   // type of effect
  FLOAT3D vNormal,                // normal for orientative effects
  FLOAT3D vDirection,             // direction oriented effects
  FLOAT3D vStretch,               // stretch effect model
  COLOR colMuliplier,             // color multiplier
};

%{
void CBasicEffect_OnPrecache(CDLLEntityClass *pdec, INDEX iUser) 
{
  switch ((BasicEffectType)iUser) {
  case BET_ROCKET:
  case BET_ROCKET_PLANE:
    pdec->PrecacheSound(SOUND_EXPLOSION);
    pdec->PrecacheSound(SOUND_EXPLOSION01);
    pdec->PrecacheSound(SOUND_EXPLOSION02);
    pdec->PrecacheSound(SOUND_EXPLOSION03);
    pdec->PrecacheSound(SOUND_EXPLOSION04);
    pdec->PrecacheSound(SOUND_EXPLOSION05);
    pdec->PrecacheSound(SOUND_EXPLOSION06);
    pdec->PrecacheSound(SOUND_EXPLOSION07);
    pdec->PrecacheSound(SOUND_EXPLOSION08);
    pdec->PrecacheModel(MDL_ROCKET_EXPLOSION);
    pdec->PrecacheTexture(TXT_ROCKET_EXPLOSION);
    pdec->PrecacheModel(MDL_PARTICLES_EXPLOSION);
    pdec->PrecacheTexture(TXT_PARTICLES_EXPLOSION);
    pdec->PrecacheModel(MDL_ROCKET3D_EXPLOSION);
    pdec->PrecacheTexture(TXT_ROCKET_EXPLOSION);
    pdec->PrecacheModel(MDL_PARTICLES3D_EXPLOSION);
    pdec->PrecacheTexture(TXT_PARTICLES_EXPLOSION);
    break;
  case BET_BOMB:
  case BET_GRENADE:
  case BET_GRENADE_PLANE:
    pdec->PrecacheSound(SOUND_EXPLOSION);
    pdec->PrecacheSound(SOUND_EXPLOSION01);
    pdec->PrecacheSound(SOUND_EXPLOSION02);
    pdec->PrecacheSound(SOUND_EXPLOSION03);
    pdec->PrecacheSound(SOUND_EXPLOSION04);
    pdec->PrecacheSound(SOUND_EXPLOSION05);
    pdec->PrecacheSound(SOUND_EXPLOSION06);
    pdec->PrecacheSound(SOUND_EXPLOSION07);
    pdec->PrecacheSound(SOUND_EXPLOSION08);
    pdec->PrecacheModel(MDL_GRENADE_EXPLOSION);
    pdec->PrecacheTexture(TXT_GRENADE_EXPLOSION);
    pdec->PrecacheModel(MDL_PARTICLES_EXPLOSION);
    pdec->PrecacheTexture(TXT_PARTICLES_EXPLOSION);
    pdec->PrecacheModel(MDL_GRENADE3D_EXPLOSION);
    pdec->PrecacheTexture(TXT_GRENADE_EXPLOSION);
    pdec->PrecacheModel(MDL_PARTICLES3D_EXPLOSION);
    pdec->PrecacheTexture(TXT_PARTICLES_EXPLOSION);
    break;
  case BET_CANNON:
  case BET_CANNON_NOLIGHT:
  case BET_LIGHT_CANNON:
  case BET_HYDROGUN:
    pdec->PrecacheSound(SOUND_SMALLEXPLOSION01);
    pdec->PrecacheSound(SOUND_SMALLEXPLOSION02);
    pdec->PrecacheSound(SOUND_SMALLEXPLOSION03);
    pdec->PrecacheSound(SOUND_SMALLEXPLOSION04);
    pdec->PrecacheSound(SOUND_SMALLEXPLOSION05);
    pdec->PrecacheSound(SOUND_SMALLEXPLOSION06);
    pdec->PrecacheSound(SOUND_SMALLEXPLOSION07);
    pdec->PrecacheSound(SOUND_SMALLEXPLOSION08);
  case BET_CANNON_PLANE:
  case BET_CANNONSHOCKWAVE:
    pdec->PrecacheSound(SOUND_EXPLOSION);
    pdec->PrecacheSound(SOUND_EXPLOSION01);
    pdec->PrecacheSound(SOUND_EXPLOSION02);
    pdec->PrecacheSound(SOUND_EXPLOSION03);
    pdec->PrecacheSound(SOUND_EXPLOSION04);
    pdec->PrecacheSound(SOUND_EXPLOSION05);
    pdec->PrecacheSound(SOUND_EXPLOSION06);
    pdec->PrecacheSound(SOUND_EXPLOSION07);
    pdec->PrecacheSound(SOUND_EXPLOSION08);
    pdec->PrecacheModel(MDL_CANNON_EXPLOSION);
    pdec->PrecacheTexture(TXT_CANNON_EXPLOSION);
    pdec->PrecacheModel(MDL_CANNON3D_EXPLOSION);
    pdec->PrecacheTexture(TXT_CANNON_EXPLOSION);
    pdec->PrecacheModel(MODEL_CANNONSHOCKWAVE);
    pdec->PrecacheTexture(TEXTURE_CANNONSHOCKWAVE);
    break;
  case BET_EXPLOSIONSTAIN:
    pdec->PrecacheModel(MODEL_EXPLOSION_STAIN);
    pdec->PrecacheTexture(TEXTURE_EXPLOSION_STAIN);
    break;
  case BET_CANNONEXPLOSIONSTAIN:
    pdec->PrecacheModel(MODEL_CANNON_EXPLOSION_STAIN);
    pdec->PrecacheTexture(TEXTURE_CANNON_EXPLOSION_STAIN);
    break;
  case BET_SHOCKWAVE:
    pdec->PrecacheModel(MODEL_SHOCKWAVE);
    pdec->PrecacheTexture(TEXTURE_SHOCKWAVE);
    break;
  case BET_LASERWAVE:
    pdec->PrecacheModel(MODEL_LASERWAVE);
    pdec->PrecacheTexture(TEXTURE_LASERWAVE);
    break;
  case BET_BULLETSTAINSTONE:
  case BET_BULLETSTAINSAND:
  case BET_BULLETSTAINREDSAND:
  case BET_BULLETSTAINWATER:
  case BET_BULLETSTAINUNDERWATER:
  case BET_BULLETSTAINSTONENOSOUND:
  case BET_BULLETSTAINSANDNOSOUND:
  case BET_BULLETSTAINREDSANDNOSOUND:
  case BET_BULLETSTAINWATERNOSOUND:
  case BET_BULLETSTAINUNDERWATERNOSOUND:
  case BET_BULLETSTAINGRASS:
  case BET_BULLETSTAINWOOD:
  case BET_BULLETSTAINGRASSNOSOUND:
  case BET_BULLETSTAINWOODNOSOUND:
  case BET_BULLETSTAINSNOW:
  case BET_BULLETSTAINSNOWNOSOUND:
  case BET_BULLETSTAINLAVA:
  case BET_BULLETSTAINLAVANOSOUND:
  case BET_BULLETSTAINACID:
  case BET_BULLETSTAINACIDNOSOUND:
  case BET_BULLETSTAINGLASS:
  case BET_BULLETSTAINGLASSNOSOUND:
  case BET_BULLETSTAINFLESH:
  case BET_BULLETSTAINFLESHNOSOUND:
  case BET_BULLETSTAINMETAL:
  case BET_BULLETSTAINMETALNOSOUND:
  case BET_BULLETSTAINENERGY:
  case BET_BULLETSTAINENERGYNOSOUND:
    pdec->PrecacheModel(MODEL_BULLET_HIT);
    pdec->PrecacheTexture(TEXTURE_BULLET_HIT);
    pdec->PrecacheTexture(TEXTURE_BULLET_SAND);
    pdec->PrecacheModel(MODEL_SHOCKWAVE);
    pdec->PrecacheTexture(TEXTURE_WATER_WAVE);
    pdec->PrecacheSound(SOUND_BULLET_STONE);
    pdec->PrecacheSound(SOUND_BULLET_SAND);
    pdec->PrecacheSound(SOUND_BULLET_WATER);
    pdec->PrecacheModel(MODEL_BULLET_STAIN);
    pdec->PrecacheTexture(TEXTURE_BULLET_STAIN);
    pdec->PrecacheSound(SOUND_BULLET_GRASS);
    pdec->PrecacheSound(SOUND_BULLET_WOOD);
    pdec->PrecacheSound(SOUND_BULLET_SNOW);
    pdec->PrecacheSound(SOUND_BULLET_LAVA);
    pdec->PrecacheSound(SOUND_BULLET_GLASS);
    pdec->PrecacheTexture(TEXTURE_BULLET_STAIN_GLASS);
    pdec->PrecacheSound(SOUND_BULLET_STAIN_FLESH);
    pdec->PrecacheSound(SOUND_BULLET_METAL);
    pdec->PrecacheSound(SOUND_BULLET_ENERGY);
    pdec->PrecacheTexture(TEXTURE_BULLET_ENERGY);
    break;
  case BET_BULLETTRAIL:
    pdec->PrecacheModel(MODEL_BULLET_TRAIL);
    pdec->PrecacheTexture(TEXTURE_BULLET_TRAIL);
    break;
  case BET_GIZMO_SPLASH_FX:
    pdec->PrecacheModel(MODEL_BULLET_HIT);
    pdec->PrecacheTexture(TEXTURE_BULLET_HIT);
    pdec->PrecacheSound(SOUND_GIZMO_SPLASH1);
    pdec->PrecacheSound(SOUND_GIZMO_SPLASH2);
    pdec->PrecacheSound(SOUND_GIZMO_SPLASH3);
    break;
  case BET_BLOODEXPLODE:
    pdec->PrecacheModel(MODEL_BLOOD_EXPLODE);
    pdec->PrecacheTexture(TEXTURE_BLOOD_EXPLODE);
    pdec->PrecacheSound(SOUND_BULLET_FLESH);
    break;
  case BET_BLOODSTAIN:
  case BET_BLOODSTAINGROW:
  case BET_BLOODSPILL:
  case BET_GIZMOSTAIN:
  case BET_GOOSTAIN:
    pdec->PrecacheModel(MODEL_BLOOD_STAIN);
    pdec->PrecacheTexture(TEXTURE_BLOOD_STAIN1);
    pdec->PrecacheTexture(TEXTURE_BLOOD_STAIN2);
    pdec->PrecacheTexture(TEXTURE_BLOOD_STAIN3);
    pdec->PrecacheTexture(TEXTURE_BLOOD_STAIN4);
    pdec->PrecacheTexture(TEXTURE_BLOOD_SPILL1);
    pdec->PrecacheTexture(TEXTURE_BLOOD_SPILL2);
    pdec->PrecacheTexture(TEXTURE_BLOOD_SPILL3);
    pdec->PrecacheTexture(TEXTURE_BLOOD_FLOWER1);
    pdec->PrecacheTexture(TEXTURE_BLOOD_FLOWER2);
    pdec->PrecacheTexture(TEXTURE_BLOOD_FLOWER3);
    break;
  case BET_TELEPORT:
  case BET_TELEPORT_REVERSE:
    pdec->PrecacheModel(MODEL_TELEPORT_EFFECT);
    pdec->PrecacheTexture(TEXTURE_TELEPORT_EFFECT);
    pdec->PrecacheSound(SOUND_TELEPORT);
    pdec->PrecacheSound(SOUND_TELEPORT_REVERSE);
    break;
  case BET_PLASMA_EXPLOSION:
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION);
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION01);
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION02);
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION03);
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION04);
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION05);
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION06);
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION07);
    pdec->PrecacheSound(SOUND_PLASMA_EXPLOSION08);

  case BET_FLESH_SPLAT_FX:
    pdec->PrecacheModel(MODEL_BULLET_HIT);
    pdec->PrecacheTexture(TEXTURE_BULLET_HIT);
    pdec->PrecacheSound(SOUND_FLESH_SPLAT1);
    pdec->PrecacheSound(SOUND_FLESH_SPLAT2);
    pdec->PrecacheSound(SOUND_FLESH_SPLAT3);
  case BET_BONE_SPLAT_FX:
    pdec->PrecacheModel(MODEL_BULLET_HIT);
    pdec->PrecacheTexture(TEXTURE_BULLET_HIT);
    pdec->PrecacheSound(SOUND_BONE_SPLAT1);
    pdec->PrecacheSound(SOUND_BONE_SPLAT2);
    pdec->PrecacheSound(SOUND_BONE_SPLAT3);
  case BET_SPIDER_SPLAT_FX:
    pdec->PrecacheModel(MODEL_BULLET_HIT);
    pdec->PrecacheTexture(TEXTURE_BULLET_HIT);
    pdec->PrecacheSound(SOUND_SPIDER_SPLAT);
  case BET_FLOATER_SPLAT_FX:
    pdec->PrecacheModel(MODEL_BULLET_HIT);
    pdec->PrecacheTexture(TEXTURE_BULLET_HIT);
    pdec->PrecacheSound(SOUND_FLOATER_SPLAT1);
    pdec->PrecacheSound(SOUND_FLOATER_SPLAT2);
    pdec->PrecacheSound(SOUND_FLOATER_SPLAT3);
  case BET_ARROWHIT:
    pdec->PrecacheSound(SOUND_ARROWHIT);
  case BET_GASCLOUD:
  case BET_HIVEBRAIN:
    pdec->PrecacheSound(SOUND_GASCLOUD);
    pdec->PrecacheModel(MDL_T3DGM_EXPLOSION);
    pdec->PrecacheTexture(TEXTURE_GASCLOUD);
    pdec->PrecacheSound(SOUND_HIVEBRAIN);
  case BET_T3DGMX:
    pdec->PrecacheSound(SOUND_HUGEX);
    pdec->PrecacheModel(MDL_T3DGM_EXPLOSION);
    pdec->PrecacheTexture(TEXTURE_T3DGMX);
  case BET_HAMMER_FLESH:
    pdec->PrecacheSound(SOUND_HAMMER_FLESH1);
    pdec->PrecacheSound(SOUND_HAMMER_FLESH2);
    pdec->PrecacheSound(SOUND_HAMMER_FLESH3);
  case BET_HAMMER_ROCK:
    pdec->PrecacheSound(SOUND_HAMMER_ROCK);
  case BET_HAMMER_WOOD:
    pdec->PrecacheSound(SOUND_HAMMER_WOOD);
  case BET_HAMMER_METAL:
    pdec->PrecacheSound(SOUND_HAMMER_METAL);
  case BET_HAMMER_GENERIC:
    pdec->PrecacheSound(SOUND_HAMMER_GENERIC);
  case BET_SAW:
    pdec->PrecacheSound(SOUND_SAW1);
    pdec->PrecacheSound(SOUND_SAW2);
    pdec->PrecacheSound(SOUND_SAW3);
  case BET_SAW_FLESH:
    pdec->PrecacheSound(SOUND_SAW_FLESH1);
    pdec->PrecacheSound(SOUND_SAW_FLESH2);
    pdec->PrecacheSound(SOUND_SAW_FLESH3);
    pdec->PrecacheSound(SOUND_SAW_FLESH4);
    break;

  default:
    ASSERT(FALSE);
  }
}
%}

class CBasicEffect : CRationalEntity {
name      "BasicEffect";
thumbnail "";
features "ImplementsOnPrecache", "CanBePredictable";

properties:
  1 enum BasicEffectType m_betType = BET_NONE, // type of effect
  2 FLOAT m_fWaitTime = 0.0f,       // wait time
  3 FLOAT m_fFadeTime = 0.0f,       // fade away time
  4 BOOL  m_bFade = FALSE,          // fade is enabled
  5 FLOAT m_fFadeStartTime  = 0.0f,        // fade away start time
  9 FLOAT m_fFadeStartAlpha = 1.0f,        // alpha value 
  6 FLOAT3D m_vNormal    = FLOAT3D(0,0,0), // normal for orientative effects
  7 FLOAT3D m_vStretch   = FLOAT3D(0,0,0), // stretch effect
  8 FLOAT3D m_vDirection = FLOAT3D(0,0,0), // direction oriented effects
  10 FLOAT m_fDepthSortOffset = 0.0f,
  11 FLOAT m_fFadeInSpeed = 0.0f,
  12 FLOAT m_tmSpawn = 0.0f,  // when it was spawned
  13 FLOAT m_tmWaitAfterDeath = 0.0f,       // after death wait time

 20 BOOL m_bLightSource = FALSE,    // effect is also light source
 21 CAnimObject m_aoLightAnimation, // light animation object
 22 INDEX m_iLightAnimation = -1,   // lignt animation index
 23 COLOR m_colMultiplyColor = 0xFFFFFFFF, // color multiplier

 30 CSoundObject m_soEffect,        // sound channel
 31 FLOAT m_fSoundTime = 0.0f,      // wait for sound to end

 40 enum EffectParticlesType m_eptType = EPT_NONE, // type of particle effect
 41 FLOAT m_tmWhenShot = 0.0f, // when entity was shot
 42 FLOAT3D m_vGravity = FLOAT3D(0,0,0), // simulated direction of gravity

{
  CLightSource m_lsLightSource;
}

components:

// ********** PROJECTILE EXPLOSIONS **********
  1 model   MDL_ROCKET_EXPLOSION      "Models\\Effects\\ExplosionRocket\\ExplosionRocket.mdl",
  2 model   MDL_ROCKET3D_EXPLOSION    "Models\\Effects\\ExplosionRocket\\ExplosionRocket3D.mdl",
  3 texture TXT_ROCKET_EXPLOSION      "Models\\Effects\\Explosionrocket\\Texture.tex",
  4 model   MDL_GRENADE_EXPLOSION     "Models\\Effects\\ExplosionGrenade\\ExplosionGrenade.mdl",
  5 model   MDL_GRENADE3D_EXPLOSION   "Models\\Effects\\ExplosionGrenade\\ExplosionGrenade3D.mdl",
  6 texture TXT_GRENADE_EXPLOSION     "Models\\Effects\\ExplosionGrenade\\Texture.tex",
  7 model   MDL_PARTICLES_EXPLOSION   "Models\\Effects\\ExplosionParticles\\Particles.mdl",
  8 model   MDL_PARTICLES3D_EXPLOSION "Models\\Effects\\ExplosionParticles\\Particles3D.mdl",
  9 texture TXT_PARTICLES_EXPLOSION   "Models\\Effects\\ExplosionParticles\\Texture.tex",
 10 sound   SOUND_EXPLOSION           "Sounds\\Weapons\\_Explosion02.wav",
 11 model   MDL_CANNON_EXPLOSION     "Models\\Effects\\ExplosionGrenade\\ExplosionGrenade.mdl",
 12 model   MDL_CANNON3D_EXPLOSION   "Models\\Effects\\ExplosionGrenade\\ExplosionGrenade3D.mdl",
 13 texture TXT_CANNON_EXPLOSION     "Models\\Effects\\ExplosionGrenade\\Texture.tex",

// ********** BULLET HIT **********
 15 model   MODEL_BULLET_HIT      "Models\\Effects\\BulletParticles\\BulletParticles.mdl",
 16 texture TEXTURE_BULLET_HIT    "Models\\Effects\\BulletParticles\\BulletParticles.tex",
 18 model   MODEL_BULLET_STAIN    "Models\\Effects\\BulletOnTheWall\\Bullet.mdl",
 19 texture TEXTURE_BULLET_STAIN  "Models\\Effects\\BulletOnTheWall\\Bullet.tex",
 70 texture TEXTURE_BULLET_TRAIL  "Models\\Effects\\BulletTrail\\BulletTrail.tex",
 71 model   MODEL_BULLET_TRAIL    "Models\\Effects\\BulletTrail\\BulletTrail.mdl",

 90 sound   SOUND_BULLET_STONE    "Sounds\\Weapons\\_BulletHitWall.wav",
 91 sound   SOUND_BULLET_SAND     "Sounds\\Weapons\\BulletHitSand.wav",
 92 sound   SOUND_BULLET_WATER    "Sounds\\Weapons\\BulletHitWater.wav",
 93 sound   SOUND_BULLET_FLESH    "Sounds\\Weapons\\_BulletHitFlesh.wav",
 94 texture TEXTURE_BULLET_SAND   "Models\\Effects\\BulletOnTheWall\\BulletSand.tex",
 95 sound   SOUND_BULLET_GRASS    "SoundsMP\\Weapons\\BulletHitGrass.wav",
 96 sound   SOUND_BULLET_WOOD     "SoundsMP\\Weapons\\BulletHitWood.wav",
 97 sound   SOUND_BULLET_SNOW     "SoundsMP\\Weapons\\BulletHitSnow.wav",

 250 sound   SOUND_BULLET_LAVA     "SoundsF\\Weapons\\BulletHitLava.wav",
 251 sound   SOUND_BULLET_GLASS     "SoundsF\\Weapons\\BulletHitGlass.wav",
 252 texture TEXTURE_BULLET_STAIN_GLASS  "ModelsF\\Effects\\GlassCrack\\GlassCrack.tex",
 253 sound   SOUND_BULLET_STAIN_FLESH     "SoundsF\\Weapons\\BulletHitFlesh.wav",
 254 sound   SOUND_BULLET_METAL     "SoundsF\\Weapons\\BulletHitMetal.wav",
 255 sound   SOUND_BULLET_ENERGY     "SoundsF\\Weapons\\BulletHitEnergy.wav",
 256 texture   TEXTURE_BULLET_ENERGY     "ModelsF\\Effects\\ShockWavePurple\\ShockWavePurple.tex",

// ********** BLOOD **********
 21 model   MODEL_BLOOD_EXPLODE   "Models\\Effects\\BloodCloud\\BloodCloud.mdl",
 22 texture TEXTURE_BLOOD_EXPLODE "Models\\Effects\\BloodCloud\\BloodCloud.tex",
 23 model   MODEL_BLOOD_STAIN     "Models\\Effects\\BloodOnTheWall01\\Blood.mdl",
 24 texture TEXTURE_BLOOD_STAIN1  "Models\\Effects\\BloodOnTheWall01\\BloodStain01.tex",
 25 texture TEXTURE_BLOOD_STAIN2  "Models\\Effects\\BloodOnTheWall01\\BloodStain02.tex",
 26 texture TEXTURE_BLOOD_STAIN3  "Models\\Effects\\BloodOnTheWall01\\BloodStain03.tex",
 27 texture TEXTURE_BLOOD_STAIN4  "Models\\Effects\\BloodOnTheWall01\\BloodStain04.tex",
 28 texture TEXTURE_BLOOD_SPILL1  "Models\\Effects\\BloodOnTheWall01\\BloodSpill02.tex",
 29 texture TEXTURE_BLOOD_SPILL2  "Models\\Effects\\BloodOnTheWall01\\BloodSpill05.tex",
 30 texture TEXTURE_BLOOD_SPILL3  "Models\\Effects\\BloodOnTheWall01\\BloodSpill06.tex",
 31 texture TEXTURE_BLOOD_FLOWER1 "Models\\Effects\\Flowers\\Flowers1s.tex",
 32 texture TEXTURE_BLOOD_FLOWER2 "Models\\Effects\\Flowers\\Flowers2s.tex",
 33 texture TEXTURE_BLOOD_FLOWER3 "Models\\Effects\\Flowers\\Flowers3s.tex",
 
// ********** SHOCK WAVE **********
 40 model   MODEL_SHOCKWAVE       "Models\\Effects\\ShockWave01\\ShockWave.mdl",
 41 texture TEXTURE_SHOCKWAVE     "Models\\Effects\\ShockWave01\\Textures\\ShockWave.tex",
 
 42 model   MODEL_CANNONSHOCKWAVE   "Models\\Effects\\ShockWave01\\ShockWave.mdl",
 43 texture TEXTURE_CANNONSHOCKWAVE "Models\\Effects\\ShockWave01\\Textures\\ShockWave.tex",

// ********** EXPLOSION STAIN **********
 45 model   MODEL_EXPLOSION_STAIN     "Models\\Effects\\BurnedStainOnTheWall\\BurnedStainOnTheWall.mdl",
 46 texture TEXTURE_EXPLOSION_STAIN   "Models\\Effects\\BurnedStainOnTheWall\\BurnedStainOnTheWall.tex",

 47 model   MODEL_CANNON_EXPLOSION_STAIN     "Models\\Effects\\BurnedStainOnTheWall\\BurnedStainOnTheWall.mdl",
 48 texture TEXTURE_CANNON_EXPLOSION_STAIN   "Models\\Effects\\BurnedStainOnTheWall\\BurnedStainOnTheWall.tex",

// ********** LASER WAVE **********
 50 model   MODEL_LASERWAVE       "Models\\Effects\\ShockWaveGreen\\ShockWaveGreen.mdl",
 51 texture TEXTURE_LASERWAVE     "Models\\Effects\\ShockWaveGreen\\ShockWaveGreen.tex",

// ********** TELEPORT **********
 61 model   MODEL_TELEPORT_EFFECT        "Models\\Effects\\Teleport01\\Teleport.mdl",
 62 texture TEXTURE_TELEPORT_EFFECT      "Textures\\Effects\\Effect01\\Effect.tex",
 63 sound   SOUND_TELEPORT               "Sounds\\Misc\\Teleport.wav",
 64 sound   SOUND_TELEPORT_REVERSE       "SoundsF\\Misc\\Teleportbackwards.wav",

// ********** GIZMO SPLASH FX **********
 80 sound   SOUND_GIZMO_SPLASH1           "SoundsF\\Splats\\SmallSplat1.wav",
 81 sound   SOUND_GIZMO_SPLASH2           "SoundsF\\Splats\\SmallSplat2.wav",
 82 sound   SOUND_GIZMO_SPLASH3           "SoundsF\\Splats\\SmallSplat3.wav",

// ********** Water shockwave texture **********
 100 texture TEXTURE_WATER_WAVE          "Models\\Effects\\ShockWave01\\Textures\\WaterWave.tex",

// ********** PLASMA EXPLOSION **********
 200 sound   SOUND_PLASMA_EXPLOSION           "ModelsMP\\Weapons\\PlasmaThrower\\Sounds\\_Explosion.wav",
 201 sound   SOUND_HYDROGUN                   "SoundsF\\Weapons\\Acid.wav",
 310 sound   SOUND_PLASMA_EXPLOSION01         "SoundsF\\Destruction\\PlasmaExplosion01.wav",
 311 sound   SOUND_PLASMA_EXPLOSION02         "SoundsF\\Destruction\\PlasmaExplosion02.wav",
 312 sound   SOUND_PLASMA_EXPLOSION03         "SoundsF\\Destruction\\PlasmaExplosion03.wav",
 313 sound   SOUND_PLASMA_EXPLOSION04         "SoundsF\\Destruction\\PlasmaExplosion04.wav",
 314 sound   SOUND_PLASMA_EXPLOSION05         "SoundsF\\Destruction\\PlasmaExplosion05.wav",
 315 sound   SOUND_PLASMA_EXPLOSION06         "SoundsF\\Destruction\\PlasmaExplosion06.wav",
 316 sound   SOUND_PLASMA_EXPLOSION07         "SoundsF\\Destruction\\PlasmaExplosion07.wav",
 317 sound   SOUND_PLASMA_EXPLOSION08         "SoundsF\\Destruction\\PlasmaExplosion08.wav",

// ********** FLESH SPLAT FX **********
 210 sound   SOUND_FLESH_SPLAT1            "SoundsF\\Splats\\Splat1.wav",
 211 sound   SOUND_FLESH_SPLAT2           "SoundsF\\Splats\\Splat2.wav",
 212 sound   SOUND_FLESH_SPLAT3           "SoundsF\\Splats\\Splat3.wav",
// ********** BONE SPLAT FX **********
 215 sound   SOUND_BONE_SPLAT1            "SoundsF\\Splats\\BoneSplat1.wav",
 216 sound   SOUND_BONE_SPLAT2           "SoundsF\\Splats\\BoneSplat2.wav",
 217 sound   SOUND_BONE_SPLAT3           "SoundsF\\Splats\\BoneSplat3.wav",
// ********** SPIDER SPLAT FX **********
 220 sound   SOUND_SPIDER_SPLAT            "ModelsMP\\Enemies\\SS2\\MechaSpider\\Sounds\\Baby\\Death.wav",
// ********** FLOATER SPLAT FX **********
 230 sound   SOUND_FLOATER_SPLAT1            "ModelsMP\\Enemies\\SS2\\Floater\\Sounds\\Death1.wav",
 231 sound   SOUND_FLOATER_SPLAT2            "ModelsMP\\Enemies\\SS2\\Floater\\Sounds\\Death2.wav",
 232 sound   SOUND_FLOATER_SPLAT3            "ModelsMP\\Enemies\\SS2\\Floater\\Sounds\\Death3.wav",
// ********** ARROW HIT **********
 240 sound   SOUND_ARROWHIT            "ModelsF\\NextEncounter\\Enemies\\Chariot\\Sounds\\ArrowHit.wav",

// ********** GASCLOUD **********
 260 model   MDL_T3DGM_EXPLOSION        "ModelsF\\t3dgm\\Explosion\\Explosion.mdl",
 261 texture TEXTURE_GASCLOUD           "ModelsF\\t3dgm\\Explosion\\GasCloud.tex",
 262 sound   SOUND_GASCLOUD               "SoundsF\\Hazards\\GasCloud.wav",
 266 sound   SOUND_HIVEBRAIN               "ModelsF\\t3dgm\\HiveBrain\\Sounds\\Death.wav",
// ********** T3DGMX **********
 264 texture TEXTURE_T3DGMX           "ModelsF\\t3dgm\\Explosion\\SpaceExplosion.tex",
 265 sound   SOUND_HUGEX               "SoundsF\\Destruction\\ExplosionHuge01.wav",

// ********** HAMMER FX **********
 270 sound   SOUND_HAMMER_FLESH1            "SoundsF\\Weapons\\HammerHitFlesh1.wav",
 271 sound   SOUND_HAMMER_FLESH2            "SoundsF\\Weapons\\HammerHitFlesh2.wav",
 272 sound   SOUND_HAMMER_FLESH3            "SoundsF\\Weapons\\HammerHitFlesh3.wav",
 273 sound   SOUND_HAMMER_METAL            "SoundsF\\Weapons\\HammerHitMetal.wav",
 274 sound   SOUND_HAMMER_ROCK            "SoundsF\\Weapons\\HammerHitRock.wav",
 275 sound   SOUND_HAMMER_WOOD            "SoundsF\\Weapons\\HammerHitWood.wav",
 276 sound   SOUND_HAMMER_GENERIC        "SoundsF\\Weapons\\HammerGeneric.wav",

// ********** SAW FX **********
 280 sound   SOUND_SAW1            "SoundsF\\Weapons\\Saw_01.wav",
 281 sound   SOUND_SAW2            "SoundsF\\Weapons\\Saw_02.wav",
 282 sound   SOUND_SAW3            "SoundsF\\Weapons\\Saw_03.wav",
 283 sound   SOUND_SAW_FLESH1            "SoundsF\\Weapons\\Saw_Flesh01.wav",
 284 sound   SOUND_SAW_FLESH2            "SoundsF\\Weapons\\Saw_Flesh02.wav",
 285 sound   SOUND_SAW_FLESH3            "SoundsF\\Weapons\\Saw_Flesh03.wav",
 286 sound   SOUND_SAW_FLESH4            "SoundsF\\Weapons\\Saw_Flesh04.wav",

// ********** NEW EXPLOSIONS **********
 290 sound   SOUND_EXPLOSION01           "SoundsF\\Destruction\\Explosion01.wav",
 291 sound   SOUND_EXPLOSION02           "SoundsF\\Destruction\\Explosion02.wav",
 292 sound   SOUND_EXPLOSION03           "SoundsF\\Destruction\\Explosion03.wav",
 293 sound   SOUND_EXPLOSION04           "SoundsF\\Destruction\\Explosion04.wav",
 294 sound   SOUND_EXPLOSION05           "SoundsF\\Destruction\\Explosion05.wav",
 295 sound   SOUND_EXPLOSION06           "SoundsF\\Destruction\\Explosion06.wav",
 296 sound   SOUND_EXPLOSION07           "SoundsF\\Destruction\\Explosion07.wav",
 297 sound   SOUND_EXPLOSION08           "SoundsF\\Destruction\\Explosion08.wav",

 300 sound   SOUND_SMALLEXPLOSION01           "SoundsF\\Destruction\\ExplosionSmall01.wav",
 301 sound   SOUND_SMALLEXPLOSION02           "SoundsF\\Destruction\\ExplosionSmall02.wav",
 302 sound   SOUND_SMALLEXPLOSION03           "SoundsF\\Destruction\\ExplosionSmall03.wav",
 303 sound   SOUND_SMALLEXPLOSION04           "SoundsF\\Destruction\\ExplosionSmall04.wav",
 304 sound   SOUND_SMALLEXPLOSION05           "SoundsF\\Destruction\\ExplosionSmall05.wav",
 305 sound   SOUND_SMALLEXPLOSION06           "SoundsF\\Destruction\\ExplosionSmall06.wav",
 306 sound   SOUND_SMALLEXPLOSION07           "SoundsF\\Destruction\\ExplosionSmall07.wav",
 307 sound   SOUND_SMALLEXPLOSION08           "SoundsF\\Destruction\\ExplosionSmall08.wav",

functions:

  // dump sync data to text file
  export void DumpSync_t(CTStream &strm, INDEX iExtensiveSyncCheck)  // throw char *
  {
    CRationalEntity::DumpSync_t(strm, iExtensiveSyncCheck);
    strm.FPrintF_t("Type: %d\n", m_betType);
  }

  /* Read from stream. */
  void Read_t( CTStream *istr) // throw char *
  {
    CRationalEntity::Read_t(istr);
    // setup light source
    if( m_bLightSource) {
      SetupLightSource();
    }
  }

  /* Get static light source information. */
  CLightSource *GetLightSource(void)
  {
    if( m_bLightSource && !IsPredictor()) {
      return &m_lsLightSource;
    } else {
      return NULL;
    }
  }

  // Setup light source
  void SetupLightSource(void)
  {
    if( m_iLightAnimation>=0)
    { // set light animation if available
      try {
        m_aoLightAnimation.SetData_t(CTFILENAME("Animations\\BasicEffects.ani"));
      } catch (char *strError) {
        WarningMessage(TRANS("Cannot load Animations\\BasicEffects.ani: %s"), strError);
      }
      // play light animation
      if (m_aoLightAnimation.GetData()!=NULL) {
        m_aoLightAnimation.PlayAnim(m_iLightAnimation, 0);
      }
    }

    // setup light source
    CLightSource lsNew;
    lsNew.ls_ulFlags = LSF_NONPERSISTENT|LSF_DYNAMIC;
    lsNew.ls_rHotSpot = 0.0f;
    switch (m_betType) {
      case BET_ROCKET:
        lsNew.ls_colColor = RGBToColor(100, 100, 100);
        lsNew.ls_rHotSpot = 3.0f;
        lsNew.ls_rFallOff = 12.5f;
        lsNew.ls_plftLensFlare = NULL;
        break;
      case BET_GRENADE:
        lsNew.ls_colColor = RGBToColor(200, 200, 200);
        lsNew.ls_rFallOff = 12.5f;
        lsNew.ls_plftLensFlare = NULL;
        break;
      case BET_CANNON:
      case BET_LIGHT_CANNON:
        lsNew.ls_colColor = RGBToColor(200, 200, 200);
        lsNew.ls_rFallOff = 12.5f;
        lsNew.ls_plftLensFlare = NULL;
        break;
      case BET_LASERWAVE:
        lsNew.ls_colColor = RGBToColor(0, 64, 0);
        lsNew.ls_rFallOff = 1.5f;
        lsNew.ls_plftLensFlare = NULL;
        break;
      case BET_BOMB:
        lsNew.ls_colColor = RGBToColor(100, 100, 100);
        lsNew.ls_rFallOff = 8.0f;
        lsNew.ls_plftLensFlare = NULL;
        break;
      case BET_PLASMA_EXPLOSION:
        lsNew.ls_colColor = RGBToColor(50, 50, 200);
        lsNew.ls_rFallOff = 8.0f;
        lsNew.ls_plftLensFlare = NULL;
        break;
      case BET_HYDROGUN:
        lsNew.ls_colColor = RGBToColor(50, 100, 200);
        lsNew.ls_rFallOff = 3.0f;
        lsNew.ls_plftLensFlare = NULL;
        break;
      case BET_T3DGMX:
        lsNew.ls_colColor = RGBToColor(150, 150, 250);
        lsNew.ls_rHotSpot = 30.0f;
        lsNew.ls_rFallOff = 45.0f;
        lsNew.ls_plftLensFlare = NULL;
        break;
      default:
        ASSERTALWAYS("Unknown light source");
    }
    lsNew.ls_ubPolygonalMask = 0;
    lsNew.ls_paoLightAnimation = NULL;

    // setup light animation
    lsNew.ls_paoLightAnimation = NULL;
    if (m_aoLightAnimation.GetData()!=NULL) {
      lsNew.ls_paoLightAnimation = &m_aoLightAnimation;
    }

    m_lsLightSource.ls_penEntity = this;
    m_lsLightSource.SetLightSource(lsNew);
  }


/* RENDER PARTICLES */


  void RenderParticles(void)
  {
    if( m_eptType != EPT_NONE)
    {
      FLOAT fStretch=0.3f;
      Particles_BulletSpray(en_ulID, GetLerpedPlacement().pl_PositionVector, m_vGravity, 
        m_eptType, m_tmSpawn, m_vStretch, fStretch);
    }
    if(m_betType==BET_EXPLOSION_DEBRIS)
    {
      Particles_ExplosionDebris1(this, m_tmSpawn, m_vStretch, m_colMultiplyColor);
      Particles_ExplosionDebris2(this, m_tmSpawn, m_vStretch, m_colMultiplyColor);
      Particles_ExplosionDebris3(this, m_tmSpawn, m_vStretch, m_colMultiplyColor);
    }
    if(m_betType==BET_COLLECT_ENERGY)
    {
      Particles_CollectEnergy(this, m_tmSpawn, m_tmSpawn+m_fWaitTime);
    }
    /*if(m_betType==BET_SNIPER_RESIDUE)
    {
      Particles_SniperResidue(this, m_tmSpawn, m_tmSpawn+m_fWaitTime, m_vNormal, m_vDirection);
    }*/
	  if(m_betType==BET_EXPLOSION_SMOKE && _pTimer->GetLerpedCurrentTick()>(m_tmSpawn+m_fWaitTime) )
    {
      Particles_ExplosionSmoke(this, m_tmSpawn+m_fWaitTime, m_vStretch, m_colMultiplyColor);
    }
    if(m_betType==BET_SUMMONERSTAREXPLOSION)
    {
      Particles_SummonerExplode(this, GetPlacement().pl_PositionVector,
                                60.0f, 1.0f, m_tmSpawn, m_fWaitTime);
    }
    if(m_betType==BET_GROWING_SWIRL)
    {
      FLOAT fStretch=(m_vStretch(1)+m_vStretch(2)+m_vStretch(3))/3.0f;
      Particles_GrowingSwirl(this, fStretch, m_tmSpawn);
    }
    if(m_betType==BET_MANTAMAN)
    {
      FLOAT fStretch=(m_vStretch(1)+m_vStretch(2)+m_vStretch(3))/3.0f;
      Particles_MantaAttack(this, fStretch, m_tmSpawn);
    }
    if(m_betType==BET_DISAPPEAR_DUST)
    {
      FLOAT fStretch=(m_vStretch(1)+m_vStretch(2)+m_vStretch(3))/3.0f;
      Particles_DisappearDust(this, fStretch, m_tmSpawn);
    }
    if(m_betType==BET_DUST_FALL)
    {
      Particles_DustFall(this, m_tmSpawn, m_vStretch);
    }    
  }



/************************************************************
 *                        FADE OUT                          *
 ************************************************************/

  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    if( m_bFade) {
      FLOAT m_fTimeRemain = m_fFadeStartTime + m_fFadeTime - _pTimer->CurrentTick();
      if (m_fTimeRemain < 0.0f) { m_fTimeRemain = 0.0f; }
      COLOR col = GetModelColor() & ~CT_AMASK;
      col |= (ULONG)(m_fFadeStartAlpha* m_fTimeRemain/m_fFadeTime *255.0f);
      SetModelColor(col);
    } else if (m_fFadeInSpeed>0) {
      TIME tmAge = _pTimer->GetLerpedCurrentTick()-m_tmSpawn;
      COLOR col = GetModelColor() ;
      col = (col &~CT_AMASK) |
        (ULONG)((255)*Clamp(tmAge*m_fFadeInSpeed/m_fWaitTime, 0.0f, 1.0f));
      SetModelColor(col);
    }

    return FALSE;
  };

  // get offset for depth-sorting of alpha models (in meters, positive is nearer)
  FLOAT GetDepthSortOffset(void)
  {
    return m_fDepthSortOffset;
  }



/************************************************************
 *                GLOBAL SUPPORT FUNCTIONS                  *
 ************************************************************/

  void SetNonLoopingTexAnims(void)
  {
    CModelObject *pmo = GetModelObject();
    pmo->mo_toTexture.PlayAnim(0, 0);
    FOREACHINLIST(CAttachmentModelObject, amo_lnInMain, pmo->mo_lhAttachments, itamo) {
      CModelObject *pmoAtt = &itamo->amo_moModelObject;
      pmoAtt->mo_toTexture.PlayAnim(0, 0);
    }
  }

  void SetNormalForHalfFaceForward(void)
  {
    CPlacement3D pl = GetPlacement();
    UpVectorToAngles(m_vNormal, pl.pl_OrientationAngle);
    SetPlacement(pl);
  };

  void SetNormal(void)
  {
    CPlacement3D pl = GetPlacement();
    DirectionVectorToAngles(m_vNormal, pl.pl_OrientationAngle);
    SetPlacement(pl);
  };

  void SetNormalWithRandomBanking(void)
  {
    CPlacement3D pl = GetPlacement();
    DirectionVectorToAngles(m_vNormal, pl.pl_OrientationAngle);
    pl.pl_OrientationAngle(3) = FRnd()*360.0f;
    SetPlacement(pl);
  };

  void FindGravityVectorFromSector(void)
  {
    CBrushSector *pbscContent = NULL;
    {FOREACHSRCOFDST(en_rdSectors, CBrushSector, bsc_rsEntities, pbsc)
      pbscContent = &*pbsc;
      break;
    ENDFOR;}

    if( pbscContent == NULL)
    {
      return;
    }
    INDEX iForceType = pbscContent->GetForceType();
    CEntity *penBrush = pbscContent->bsc_pbmBrushMip->bm_pbrBrush->br_penEntity;
    CForceStrength fsGravity;
    CForceStrength fsField;
    penBrush->GetForce( iForceType, en_plPlacement.pl_PositionVector, fsGravity, fsField);
    // remember gravity vector
    m_vGravity = fsGravity.fs_vDirection;
  };

  void SetNormalAndDirection(void)
  {
    // special case for stains without sliding
    if( m_vDirection.Length() < 0.01f) {
      SetNormalWithRandomBanking();
      return;
    }

    FLOAT3D vX;
    FLOAT3D vY = -m_vDirection;
    FLOAT3D vZ = -m_vNormal;
    vZ.Normalize();
    vX = vY*vZ;
    vX.Normalize();
    vY = vZ*vX;
    vY.Normalize();

    FLOATmatrix3D m;
    m(1,1) = vX(1); m(1,2) = vY(1); m(1,3) = vZ(1);
    m(2,1) = vX(2); m(2,2) = vY(2); m(2,3) = vZ(2);
    m(3,1) = vX(3); m(3,2) = vY(3); m(3,3) = vZ(3);

    CPlacement3D pl = GetPlacement();
    DecomposeRotationMatrixNoSnap(pl.pl_OrientationAngle, m);
    SetPlacement(pl);
  };

  void RandomBanking(void)
  {
    CPlacement3D pl = GetPlacement();
    pl.pl_OrientationAngle(3) = FRnd()*360.0f;
    SetPlacement(pl);
  };

  void Stretch(void) {
    ASSERT(m_vStretch(1)>0.01f && m_vStretch(3)>0.01f && m_vStretch(3)>0.01f);
    GetModelObject()->mo_Stretch = m_vStretch;
  };

  // parent the effect if needed and adjust size not to get out of the polygon
  void ParentToNearestPolygonAndStretch(void) 
  {
    // find nearest polygon
    FLOAT3D vPoint; 
    FLOATplane3D plPlaneNormal;
    FLOAT fDistanceToEdge;
    CBrushPolygon *pbpoNearBrush = GetNearestPolygon( vPoint, plPlaneNormal, fDistanceToEdge);

    if( (m_betType>=BET_BULLETSTAINSTONE && m_betType<=BET_BULLETSTAINREDSANDNOSOUND) ||
        (m_betType>=BET_BULLETSTAINGRASS && m_betType<=BET_BULLETSTAINWOODNOSOUND) ||
        (m_betType>=BET_BULLETSTAINSNOW  && m_betType<=BET_BULLETSTAINSNOWNOSOUND))
    {
      if( pbpoNearBrush != NULL)
      {
        CBrushSector *pbscContent = pbpoNearBrush->bpo_pbscSector;
        INDEX iForceType = pbscContent->GetForceType();
        CEntity *penNearBrush = pbscContent->bsc_pbmBrushMip->bm_pbrBrush->br_penEntity;
        CForceStrength fsGravity;
        CForceStrength fsField;
        penNearBrush->GetForce( iForceType, en_plPlacement.pl_PositionVector, fsGravity, fsField);
        // remember gravity vector
        m_vGravity = fsGravity.fs_vDirection;
      }
    }

    // if there is none, or if it is portal, or it is not near enough
    if (pbpoNearBrush==NULL || (pbpoNearBrush->bpo_ulFlags&BPOF_PORTAL) 
      || (vPoint-GetPlacement().pl_PositionVector).ManhattanNorm()>0.1f*3) {
      // dissapear
      SwitchToEditorModel();
    // if polygon is found
    } else {
      CEntity *penNearBrush = pbpoNearBrush->bpo_pbscSector->bsc_pbmBrushMip->bm_pbrBrush->br_penEntity;
      FLOATaabbox3D box;
      en_pmoModelObject->GetCurrentFrameBBox( box);
      box.StretchByVector( en_pmoModelObject->mo_Stretch);
      FLOAT fOrgSize = box.Size().MaxNorm();
      FLOAT fMaxSize = fDistanceToEdge*2.0f;
      // if minimum distance from polygon edges is too small
      if( fMaxSize<fOrgSize*0.25f) {
        // dissapear
        SwitchToEditorModel();
      // if the distance is acceptable
        } else {
        // set your size to not get out of it
        FLOAT fStretch = fMaxSize/fOrgSize;
        fStretch = ClampUp( fStretch, 1.0f);
        m_vStretch = en_pmoModelObject->mo_Stretch*fStretch;
        Stretch();
        ModelChangeNotify();
        // set parent to that brush
        SetParent( penNearBrush);
      }
    }
  }


/************************************************************
 *         PROJECTILE/GRENADE EXPLOSION,  STAIN             *
 ************************************************************/

  void ProjectileExplosion(void)
  {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_ROCKET_EXPLOSION);
    SetModelMainTexture(TXT_ROCKET_EXPLOSION);
    AddAttachment(0, MDL_PARTICLES_EXPLOSION, TXT_PARTICLES_EXPLOSION);
    RandomBanking();
    SetNonLoopingTexAnims();
    m_soEffect.Set3DParameters(150.0f, 3.0f, 1.0f, 1.0f);
    INDEX iBangSound;
    switch (IRnd()%8) {
      case 0: iBangSound = SOUND_EXPLOSION01; break;
      case 1: iBangSound = SOUND_EXPLOSION02; break;
      case 2: iBangSound = SOUND_EXPLOSION03; break;
      case 3: iBangSound = SOUND_EXPLOSION04; break;
      case 4: iBangSound = SOUND_EXPLOSION05; break;
      case 5: iBangSound = SOUND_EXPLOSION06; break;
      case 6: iBangSound = SOUND_EXPLOSION07; break;
      case 7: iBangSound = SOUND_EXPLOSION08; break;
    }
    PlaySound(m_soEffect, iBangSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iBangSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = TRUE;
    m_iLightAnimation = 0;
  };

  void ProjectilePlaneExplosion(void) {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_ROCKET3D_EXPLOSION);
    SetModelMainTexture(TXT_ROCKET_EXPLOSION);
    AddAttachment(0, MDL_PARTICLES3D_EXPLOSION, TXT_PARTICLES_EXPLOSION);
    SetNormalWithRandomBanking();
    SetNonLoopingTexAnims();
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  void BombExplosion(void) {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_GRENADE_EXPLOSION);
    SetModelMainTexture(TXT_GRENADE_EXPLOSION);
    SetNonLoopingTexAnims();
    FLOAT fSizeFactor = m_vStretch.MaxNorm();
    m_soEffect.Set3DParameters(50.0f*fSizeFactor, 10.0f*fSizeFactor, 1.0f*fSizeFactor, 1.0f);
    INDEX iBangSound;
    switch (IRnd()%8) {
      case 0: iBangSound = SOUND_EXPLOSION01; break;
      case 1: iBangSound = SOUND_EXPLOSION02; break;
      case 2: iBangSound = SOUND_EXPLOSION03; break;
      case 3: iBangSound = SOUND_EXPLOSION04; break;
      case 4: iBangSound = SOUND_EXPLOSION05; break;
      case 5: iBangSound = SOUND_EXPLOSION06; break;
      case 6: iBangSound = SOUND_EXPLOSION07; break;
      case 7: iBangSound = SOUND_EXPLOSION08; break;
    }
    PlaySound(m_soEffect, iBangSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iBangSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = TRUE;
    m_iLightAnimation = 1;
  };
  
  void GizmoSplashFX(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    INDEX iGizmoSound;
    switch (IRnd()%3) {
      case 0: iGizmoSound = SOUND_GIZMO_SPLASH1; break;
      case 1: iGizmoSound = SOUND_GIZMO_SPLASH2; break;
      case 2: iGizmoSound = SOUND_GIZMO_SPLASH3; break;
    }
    PlaySound(m_soEffect, iGizmoSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iGizmoSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  void ExplosionDebris(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };
  
  void CollectEnergy(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime = 2;
    m_bLightSource = FALSE;
  }
  
  void GrowingSwirl(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime = 10.0f;
    m_bLightSource = FALSE;
  }
  
  void MantaAttack(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime = 10.0f;
    m_bLightSource = FALSE;
  }

  void DisappearDust(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime = 10.0f;
    m_bLightSource = FALSE;
  }

  void DustFall(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime = 10.0f;
    m_bLightSource = FALSE;
  }

  void SniperResidue(void)
  {
	// NOTE: m_vNormal and m_vDirection here represent the starting and the
	// ending point of this effect!!!
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime = 0.05f;
    m_bLightSource = FALSE;
  }

  void ExplosionSmoke(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime=0.25f;
    m_tmWaitAfterDeath=8.0f;
    m_bLightSource = FALSE;
  };

  void GrenadeExplosion(void) {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_GRENADE_EXPLOSION);
    SetModelMainTexture(TXT_GRENADE_EXPLOSION);
    AddAttachment(0, MDL_PARTICLES_EXPLOSION, TXT_PARTICLES_EXPLOSION);
    RandomBanking();
    SetNonLoopingTexAnims();
    m_soEffect.Set3DParameters(150.0f, 3.0f, 1.0f, 1.0f);
    INDEX iBangSound;
    switch (IRnd()%8) {
      case 0: iBangSound = SOUND_EXPLOSION01; break;
      case 1: iBangSound = SOUND_EXPLOSION02; break;
      case 2: iBangSound = SOUND_EXPLOSION03; break;
      case 3: iBangSound = SOUND_EXPLOSION04; break;
      case 4: iBangSound = SOUND_EXPLOSION05; break;
      case 5: iBangSound = SOUND_EXPLOSION06; break;
      case 6: iBangSound = SOUND_EXPLOSION07; break;
      case 7: iBangSound = SOUND_EXPLOSION08; break;
    }
    PlaySound(m_soEffect, iBangSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iBangSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = TRUE;
    m_iLightAnimation = 1;
  };

  void GrenadePlaneExplosion(void) {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_GRENADE3D_EXPLOSION);
    SetModelMainTexture(TXT_GRENADE_EXPLOSION);
    AddAttachment(0, MDL_PARTICLES3D_EXPLOSION, TXT_PARTICLES_EXPLOSION);
    SetNonLoopingTexAnims();
    SetNormalWithRandomBanking();
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  void CannonExplosion(BOOL bLoVolume, BOOL bNoLight) {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_CANNON_EXPLOSION);
    CModelObject &moExplosion = *GetModelObject();
    SetModelMainTexture(TXT_CANNON_EXPLOSION);
    moExplosion.mo_colBlendColor = m_colMultiplyColor;
    moExplosion.mo_toTexture.PlayAnim(EXPLOSION_GRENADE_TEXTURE_ANIM_FAST, 0);
    RandomBanking();
    INDEX iBangSound;
    if( bLoVolume)
    {
      m_soEffect.Set3DParameters(150.0f, 3.0f, 1.0f, 1.0f);
      switch (IRnd()%8) {
        case 0: iBangSound = SOUND_SMALLEXPLOSION01; break;
        case 1: iBangSound = SOUND_SMALLEXPLOSION02; break;
        case 2: iBangSound = SOUND_SMALLEXPLOSION03; break;
        case 3: iBangSound = SOUND_SMALLEXPLOSION04; break;
        case 4: iBangSound = SOUND_SMALLEXPLOSION05; break;
        case 5: iBangSound = SOUND_SMALLEXPLOSION06; break;
        case 6: iBangSound = SOUND_SMALLEXPLOSION07; break;
        case 7: iBangSound = SOUND_SMALLEXPLOSION08; break;
      }
    }
    else
    {
      m_soEffect.Set3DParameters(150.0f, 3.0f, 1.0f, 1.0f);
      switch (IRnd()%8) {
        case 0: iBangSound = SOUND_EXPLOSION01; break;
        case 1: iBangSound = SOUND_EXPLOSION02; break;
        case 2: iBangSound = SOUND_EXPLOSION03; break;
        case 3: iBangSound = SOUND_EXPLOSION04; break;
        case 4: iBangSound = SOUND_EXPLOSION05; break;
        case 5: iBangSound = SOUND_EXPLOSION06; break;
        case 6: iBangSound = SOUND_EXPLOSION07; break;
        case 7: iBangSound = SOUND_EXPLOSION08; break;
      }
    }
    PlaySound(m_soEffect, iBangSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iBangSound);
    m_fWaitTime = 0.8f;
    if( bNoLight)
    {
      m_bLightSource = FALSE;
    }
    else
    {
      m_bLightSource = TRUE;
      m_iLightAnimation = 1;
    }
  };

  void CannonPlaneExplosion(void) {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_CANNON3D_EXPLOSION);
    CModelObject &moExplosion = *GetModelObject();
    SetModelMainTexture(TXT_CANNON_EXPLOSION);
    moExplosion.mo_toTexture.PlayAnim(EXPLOSION_GRENADE_TEXTURE_ANIM_FAST, 0);
    SetNormalWithRandomBanking();
    m_fWaitTime = 1.2f;
    m_bLightSource = FALSE;
  };

  void Stain(void) {
    SetModel(MODEL_EXPLOSION_STAIN);
    SetModelMainTexture(TEXTURE_EXPLOSION_STAIN);
    SetNormalWithRandomBanking();
    m_fWaitTime = 5.0f;
    m_fFadeTime = 2.5f;
    m_bLightSource = FALSE;
    ParentToNearestPolygonAndStretch();
  };

  void CannonStain(void) {
    Stretch();
    SetModel(MODEL_CANNON_EXPLOSION_STAIN);
    SetModelMainTexture(TEXTURE_CANNON_EXPLOSION_STAIN);
    SetNormalWithRandomBanking();
    m_fWaitTime = 5.0f;
    m_fFadeTime = 2.5f;
    m_bLightSource = FALSE;
    ParentToNearestPolygonAndStretch();
  };

  void PlasmaExplosion(void)
  {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_PARTICLES_EXPLOSION);
    SetModelMainTexture(TXT_PARTICLES_EXPLOSION);
    RandomBanking();
    SetNonLoopingTexAnims();
    m_soEffect.Set3DParameters(150.0f, 3.0f, 1.0f, 1.0f);
    INDEX iBangSound;
    switch (IRnd()%8) {
      case 0: iBangSound = SOUND_PLASMA_EXPLOSION01; break;
      case 1: iBangSound = SOUND_PLASMA_EXPLOSION02; break;
      case 2: iBangSound = SOUND_PLASMA_EXPLOSION03; break;
      case 3: iBangSound = SOUND_PLASMA_EXPLOSION04; break;
      case 4: iBangSound = SOUND_PLASMA_EXPLOSION05; break;
      case 5: iBangSound = SOUND_PLASMA_EXPLOSION06; break;
      case 6: iBangSound = SOUND_PLASMA_EXPLOSION07; break;
      case 7: iBangSound = SOUND_PLASMA_EXPLOSION08; break;
    }
    PlaySound(m_soEffect, iBangSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iBangSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = TRUE;
    m_iLightAnimation = 0;
  };

  
  void FleshSplatFX(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    INDEX iFleshSound;
    switch (IRnd()%3) {
      case 0: iFleshSound = SOUND_FLESH_SPLAT1; break;
      case 1: iFleshSound = SOUND_FLESH_SPLAT2; break;
      case 2: iFleshSound = SOUND_FLESH_SPLAT3; break;
    }
    PlaySound(m_soEffect, iFleshSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iFleshSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  void BoneSplatFX(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    INDEX iBoneSound;
    switch (IRnd()%3) {
      case 0: iBoneSound = SOUND_BONE_SPLAT1; break;
      case 1: iBoneSound = SOUND_BONE_SPLAT2; break;
      case 2: iBoneSound = SOUND_BONE_SPLAT3; break;
    }
    PlaySound(m_soEffect, iBoneSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iBoneSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  void SpiderSplatFX(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_SPIDER_SPLAT, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_SPIDER_SPLAT);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  void FloaterSplatFX(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    INDEX iFloaterSound;
    switch (IRnd()%3) {
      case 0: iFloaterSound = SOUND_FLOATER_SPLAT1; break;
      case 1: iFloaterSound = SOUND_FLOATER_SPLAT2; break;
      case 2: iFloaterSound = SOUND_FLOATER_SPLAT3; break;
    }
    PlaySound(m_soEffect, iFloaterSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iFloaterSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  void ArrowHitFX(void)
  {
    SetPredictable(TRUE);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_ARROWHIT, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_ARROWHIT);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  void HydroExplosion(void)
  {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_PARTICLES_EXPLOSION);
    SetModelMainTexture(TXT_PARTICLES_EXPLOSION);
    CModelObject &moExplosion = *GetModelObject();
    moExplosion.mo_colBlendColor = m_colMultiplyColor;
    RandomBanking();
    SetNonLoopingTexAnims();
    m_soEffect.Set3DParameters(50.0f, 2.0f, 1.0f, 1.0f);
    INDEX iBangSound;
      switch (IRnd()%8) {
        case 0: iBangSound = SOUND_SMALLEXPLOSION01; break;
        case 1: iBangSound = SOUND_SMALLEXPLOSION02; break;
        case 2: iBangSound = SOUND_SMALLEXPLOSION03; break;
        case 3: iBangSound = SOUND_SMALLEXPLOSION04; break;
        case 4: iBangSound = SOUND_SMALLEXPLOSION05; break;
        case 5: iBangSound = SOUND_SMALLEXPLOSION06; break;
        case 6: iBangSound = SOUND_SMALLEXPLOSION07; break;
        case 7: iBangSound = SOUND_SMALLEXPLOSION08; break;
    }
    PlaySound(m_soEffect, iBangSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iBangSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = TRUE;
    m_iLightAnimation = 0;
  };

  void GasCloud(void)
  {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_T3DGM_EXPLOSION);
    SetModelMainTexture(TEXTURE_GASCLOUD);
    RandomBanking();
    SetNonLoopingTexAnims();
    m_soEffect.Set3DParameters(100.0f, 3.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_GASCLOUD, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_GASCLOUD);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
    m_iLightAnimation = 0;
  };

  void T3DGMX(void)
  {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_T3DGM_EXPLOSION);
    SetModelMainTexture(TEXTURE_T3DGMX);
    RandomBanking();
    SetNonLoopingTexAnims();
    m_soEffect.Set3DParameters(100.0f, 3.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_HUGEX, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_HUGEX);
    m_fWaitTime = 0.95f;
    m_bLightSource = TRUE;
    m_iLightAnimation = 0;
  };

  void HiveBrain(void)
  {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MDL_T3DGM_EXPLOSION);
    SetModelMainTexture(TEXTURE_GASCLOUD);
    RandomBanking();
    SetNonLoopingTexAnims();
    m_soEffect.Set3DParameters(200.0f, 30.0f, 2.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_HIVEBRAIN, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_HIVEBRAIN);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
    m_iLightAnimation = 0;
  };

  
  void HammerFlesh(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    INDEX iFleshSound;
    switch (IRnd()%3) {
      case 0: iFleshSound = SOUND_HAMMER_FLESH1; break;
      case 1: iFleshSound = SOUND_HAMMER_FLESH2; break;
      case 2: iFleshSound = SOUND_HAMMER_FLESH3; break;
    }
    PlaySound(m_soEffect, iFleshSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iFleshSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  
  void HammerMetal(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_HAMMER_METAL, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_HAMMER_METAL);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  
  void HammerRock(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_HAMMER_ROCK, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_HAMMER_ROCK);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  
  void HammerWood(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_HAMMER_WOOD, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_HAMMER_WOOD);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  
  void HammerGeneric(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_HAMMER_GENERIC, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_HAMMER_GENERIC);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  
  void Saw(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    INDEX iFleshSound;
    switch (IRnd()%3) {
      case 0: iFleshSound = SOUND_SAW1; break;
      case 1: iFleshSound = SOUND_SAW2; break;
      case 2: iFleshSound = SOUND_SAW3; break;
    }
    PlaySound(m_soEffect, iFleshSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iFleshSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };

  
  void SawFlesh(void)
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
    INDEX iFleshSound;
    switch (IRnd()%4) {
      case 0: iFleshSound = SOUND_SAW_FLESH1; break;
      case 1: iFleshSound = SOUND_SAW_FLESH2; break;
      case 2: iFleshSound = SOUND_SAW_FLESH3; break;
      case 3: iFleshSound = SOUND_SAW_FLESH4; break;
    }
    PlaySound(m_soEffect, iFleshSound, SOF_3D);
    m_fSoundTime = GetSoundLength(iFleshSound);
    m_fWaitTime = 0.95f;
    m_bLightSource = FALSE;
  };




/************************************************************
 *                   SHOCK / LASER WAVE                     *
 ************************************************************/
  void ShockWave(void) {
    SetPredictable(TRUE);
    SetModel(MODEL_SHOCKWAVE);
    CModelObject &moShockwave = *GetModelObject();
    moShockwave.PlayAnim(SHOCKWAVE_ANIM_FAST, 0);
    SetModelMainTexture(TEXTURE_SHOCKWAVE);
    SetNormal();
    SetNonLoopingTexAnims();
    m_fWaitTime = 0.4f;
    m_fFadeTime = 0.1f;
    m_bLightSource = FALSE;
  };

  void CannonShockWave(void) {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MODEL_CANNONSHOCKWAVE);
    CModelObject &moShockwave = *GetModelObject();
    moShockwave.PlayAnim(SHOCKWAVE_ANIM_SLOW, 0);
    SetModelMainTexture(TEXTURE_CANNONSHOCKWAVE);
    moShockwave.mo_toTexture.PlayAnim(SHOCKWAVE_TEXTURE_ANIM_SLOW, 0);
    SetNormal();
    m_fWaitTime = 1.25f;
    m_fFadeTime = 0.25f;
    m_bLightSource = FALSE;
  };

  void LaserWave(void) {
    SetModel(MODEL_LASERWAVE);
    GetModelObject()->StretchModel(FLOAT3D(0.75f, 0.75f, 0.75f));
    ModelChangeNotify();
    SetModelMainTexture(TEXTURE_LASERWAVE);
    SetNormalWithRandomBanking();
    SetNonLoopingTexAnims();
    m_fWaitTime = 0.05f;
    m_fFadeTime = 0.25f;
    m_bLightSource = TRUE;
    ParentToNearestPolygonAndStretch();
  };



  /************************************************************
   *                   TELEPORT                               *
   ************************************************************/
  void TeleportEffect(void)
  {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MODEL_TELEPORT_EFFECT);
    CModelObject &mo = *GetModelObject();
    SetModelMainTexture(TEXTURE_TELEPORT_EFFECT);
    mo.PlayAnim(TELEPORT_ANIM_ACTIVATE, 0);
    RandomBanking();
    FLOAT fSize = m_vStretch.MaxNorm();
    m_soEffect.Set3DParameters(40.0f*fSize, 10.0f*fSize, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_TELEPORT, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_TELEPORT);
    m_fWaitTime = 0.8f;
    m_bLightSource = FALSE;
  };

  void TeleportReverseEffect(void)
  {
    SetPredictable(TRUE);
    Stretch();
    SetModel(MODEL_TELEPORT_EFFECT);
    CModelObject &mo = *GetModelObject();
    SetModelMainTexture(TEXTURE_TELEPORT_EFFECT);
    mo.PlayAnim(TELEPORT_ANIM_ACTIVATE, 0);
    RandomBanking();
    FLOAT fSize = m_vStretch.MaxNorm();
    m_soEffect.Set3DParameters(40.0f*fSize, 10.0f*fSize, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_TELEPORT_REVERSE, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_TELEPORT_REVERSE);
    m_fWaitTime = 0.8f;
    m_bLightSource = FALSE;
  };

  /************************************************************
   *                SUMMONER STAR EXPLOSION                   *
   ************************************************************/
  void SummonerStarExplosion()
  {
    SetPredictable(TRUE);
    SetModel(MODEL_BULLET_HIT);
    SetModelMainTexture(TEXTURE_BULLET_HIT);
    m_fWaitTime=16.0f;
    m_tmWaitAfterDeath=8.0f;
    m_bLightSource = FALSE;
    m_vStretch = FLOAT3D(1.0f, 1.0f, 1.0f);
    Stretch();
  };

  /************************************************************
 *                   BULLET HIT / STAIN                     *
 ************************************************************/
  void BulletStainSand(BOOL bSound)
  {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_SAND, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_SAND);
    }
    
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_SAND);
    CModelObject &moHole = *GetModelObject();
    moHole.StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();

    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_eptType = EPT_BULLET_SAND;
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  }

  void BulletStainRedSand(BOOL bSound)
  {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_SAND, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_SAND);
    }
    
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_SAND);
    CModelObject &moHole = *GetModelObject();
    moHole.StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();
    moHole.mo_colBlendColor = 0x805030FF;

    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_eptType = EPT_BULLET_RED_SAND;
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  }

  void BulletStainStone(BOOL bSound, BOOL bSmoke)
  {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_STONE, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_STONE);
    }
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_STAIN);
    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    if( bSmoke)
    {
      m_eptType = EPT_BULLET_STONE;
    }
    else
    {
      m_eptType = EPT_BULLET_UNDER_WATER;
    }
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  }

  void BulletStainWater(BOOL bSound)
  {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_WATER, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_WATER);
    }

    SetModel(MODEL_SHOCKWAVE);
    SetModelMainTexture(TEXTURE_WATER_WAVE);
    CModelObject &moShockwave = *GetModelObject();
    moShockwave.PlayAnim(SHOCKWAVE_ANIM_MEDIUM, 0);
    moShockwave.StretchModel(FLOAT3D(0.25f, 0.25f, 0.25f));
    ModelChangeNotify();

    SetNormalWithRandomBanking();
    FindGravityVectorFromSector();
    m_fWaitTime = 0.5f;
    m_fFadeTime = 0.5f;
    m_bLightSource = FALSE;
    m_tmWaitAfterDeath = 1.0f;
    m_eptType = EPT_BULLET_WATER;
  }

  void BulletTrail(void) {
    Stretch();
    SetModel(MODEL_BULLET_TRAIL);
    SetModelMainTexture(TEXTURE_BULLET_TRAIL);
    CModelObject &mo = *GetModelObject();
    mo.mo_colBlendColor = m_colMultiplyColor;
    SetNormalForHalfFaceForward();
    m_fWaitTime = 0.1f;
    m_bLightSource = FALSE;
  };

  void BulletStainGrass(BOOL bSound) {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_GRASS, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_GRASS);
    }
    
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_STAIN);
    CModelObject &moHole = *GetModelObject();
    moHole.StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();
    moHole.mo_colBlendColor = 0x80f080FF;

    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_eptType = EPT_BULLET_GRASS;
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  };

  void BulletStainWood(BOOL bSound) {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_WOOD, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_WOOD);
    }
    
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_STAIN);
    CModelObject &moHole = *GetModelObject();
    moHole.StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();
    moHole.mo_colBlendColor = 0xffc080FF;

    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_eptType = EPT_BULLET_WOOD;
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  };

  void BulletStainSnow(BOOL bSound) {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_SNOW, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_SNOW);
    }
    
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_STAIN);
    CModelObject &moHole = *GetModelObject();
    moHole.StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();
    moHole.mo_colBlendColor = 0xFFFFFFFF;

    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_eptType = EPT_BULLET_SNOW;
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  };



  void BulletStainLava(BOOL bSound)
  {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_LAVA, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_LAVA);
    }

    SetModel(MODEL_SHOCKWAVE);
    SetModelMainTexture(TEXTURE_SHOCKWAVE);
    CModelObject &moShockwave = *GetModelObject();
    moShockwave.PlayAnim(SHOCKWAVE_ANIM_MEDIUM, 0);
    moShockwave.StretchModel(FLOAT3D(0.05f, 0.05f, 0.05f));
    ModelChangeNotify();

    SetNormalWithRandomBanking();
    FindGravityVectorFromSector();
    m_fWaitTime = 0.5f;
    m_fFadeTime = 0.5f;
    m_bLightSource = FALSE;
    m_tmWaitAfterDeath = 1.0f;
    m_eptType = EPT_BULLET_LAVA;
  }

  void BulletStainAcid(BOOL bSound)
  {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_WATER, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_WATER);
    }
    SetModel(MODEL_LASERWAVE);
    GetModelObject()->StretchModel(FLOAT3D(0.75f, 0.75f, 0.75f));
    ModelChangeNotify();
    SetModelMainTexture(TEXTURE_LASERWAVE);
    SetNonLoopingTexAnims();
    m_fWaitTime = 0.05f;
    m_fFadeTime = 0.25f;

    SetNormalWithRandomBanking();
    FindGravityVectorFromSector();
    m_bLightSource = FALSE;
    m_tmWaitAfterDeath = 1.0f;
    m_eptType = EPT_BULLET_ACID;
  }

  void BulletStainGlass(BOOL bSound) {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_GLASS, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_GLASS);
    }
    
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_STAIN_GLASS);
    CModelObject &moHole = *GetModelObject();
    moHole.StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();

    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_eptType = EPT_BULLET_GLASS;
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  };

  void BulletStainFlesh(BOOL bSound) {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_STAIN_FLESH, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_STAIN_FLESH);
    }
    
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_SAND);
    CModelObject &moHole = *GetModelObject();
    moHole.StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();
    moHole.mo_colBlendColor = 0xFF0000FF;

    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_eptType = EPT_BULLET_FLESH;
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  };

  void BulletStainMetal(BOOL bSound)
  {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_METAL, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_METAL);
    }
    SetModel(MODEL_BULLET_STAIN);
    SetModelMainTexture(TEXTURE_BULLET_STAIN);
    SetNormalWithRandomBanking();
    m_fWaitTime = 2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
      m_eptType = EPT_BULLET_METAL;
    FLOAT3D vTemp = m_vStretch;
    ParentToNearestPolygonAndStretch();
    m_vStretch = vTemp;
  }

  void BulletStainEnergy(BOOL bSound)
  {
    if( bSound)
    {
      m_soEffect.Set3DParameters(20.0f, 10.0f, 1.0f, 1.0f+FRnd()*0.2f);
      PlaySound(m_soEffect, SOUND_BULLET_ENERGY, SOF_3D);
      m_fSoundTime = GetSoundLength(SOUND_BULLET_ENERGY);
    }
    SetModel(MODEL_LASERWAVE);
    GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    ModelChangeNotify();
    SetModelMainTexture(TEXTURE_BULLET_ENERGY);
    SetNonLoopingTexAnims();
    m_fWaitTime = 0.05f;
    m_fFadeTime = 0.25f;

    SetNormalWithRandomBanking();
    FindGravityVectorFromSector();
    m_bLightSource = FALSE;
    m_tmWaitAfterDeath = 1.0f;
    m_eptType = EPT_BULLET_ENERGY;
  }

/************************************************************
 *                  BLOOD SPILL / STAIN                     *
 ************************************************************/


  // bullet hitpoint wound
  void BloodExplode(void)
  {
    // readout blood type
    const INDEX iBloodType = GetSP()->sp_iBlood;
    if( iBloodType<1) { return; }

    SetPredictable(TRUE);
    Stretch();
    SetModel(MODEL_BLOOD_EXPLODE);
    if( iBloodType==3) {
      // flower mode! :)
      SetModelColor( RGBAToColor( 255,255,255,255));
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER2);  break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER3);  break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      }
    } else {
      SetModelMainTexture(TEXTURE_BLOOD_EXPLODE);
      if( iBloodType==2) { SetModelColor( RGBAToColor( 250,20,20,255)); }
      else               { SetModelColor( RGBAToColor( 0,250,0,255)); }
    }
    //RandomBanking();
    m_soEffect.Set3DParameters(7.5f, 5.0f, 1.0f, 1.0f);
    PlaySound(m_soEffect, SOUND_BULLET_FLESH, SOF_3D);
    m_fSoundTime = GetSoundLength(SOUND_BULLET_FLESH);
    m_fWaitTime = 0.25f;
    m_fFadeTime = 0.75f;
    m_bLightSource = FALSE;
  }


  // blood stain on wall/floor
  void BloodStain(void)
  {
    // readout blood type
    const INDEX iBloodType = GetSP()->sp_iBlood;
    if( iBloodType<1) { return; }

    Stretch();
    SetModel(MODEL_BLOOD_STAIN);
    if( iBloodType==3) {
      // flower mode! :)
      SetModelColor( RGBAToColor( 255,255,255,255));
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER2);  break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER3);  break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      }
    } else {
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN1);   break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN2);   break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN3);   break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_STAIN4);   break; }
      }
      if( iBloodType==2) { SetModelColor( RGBAToColor( 250,20,20,255)); }
      else               { SetModelColor( RGBAToColor( 0,250,0,255)); }
    }

    SetNormalAndDirection();
    m_fWaitTime = 12.0f + FRnd()*3.0f;
    m_fFadeTime = 3.0f;
    m_bLightSource = FALSE;
    m_fDepthSortOffset = -0.1f;
    ParentToNearestPolygonAndStretch();
  }


  // blood stain on wall/floor that grows
  void BloodStainGrow(void)
  {
    // readout blood type
    const INDEX iBloodType = GetSP()->sp_iBlood;
    if( iBloodType<1) { return; }

    SetPredictable(TRUE);
    Stretch();
    SetModel(MODEL_BLOOD_STAIN);
    if( iBloodType==3) {
      // flower mode! :)
      SetModelColor( RGBAToColor( 255,255,255,255));
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER2);  break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER3);  break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      }
    } else {
      SetModelMainTexture(TEXTURE_BLOOD_STAIN4);
      if( iBloodType==2) { SetModelColor( RGBAToColor( 250,20,20,255)); }
      else               { SetModelColor( RGBAToColor( 0,250,0,255)); }
    }
    SetNormalAndDirection();
    m_bLightSource = FALSE;
    m_fDepthSortOffset = -0.1f;
    ParentToNearestPolygonAndStretch();

    m_fWaitTime = 15.0f + FRnd()*2.0f;
    m_fFadeTime = 2.0f;
    m_fFadeInSpeed = 4.0f;
    CModelObject &mo = *GetModelObject();
    mo.PlayAnim(BLOOD_ANIM_GROW, 0);
  }


  // gizmo stain on wall/floor
  void GizmoStain(void)
  {
    // readout blood type
    const INDEX iBloodType = GetSP()->sp_iBlood;
    if( iBloodType<1) { return; }

    Stretch();
    SetModel(MODEL_BLOOD_STAIN);
    if( iBloodType==3) {
      // flower mode! :)
      SetModelColor( RGBAToColor( 255,255,255,255));
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER2);  break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER3);  break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      }
    } else {
      SetModelColor( RGBAToColor( 0,250,0,255));
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN1);   break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN2);   break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN3);   break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_STAIN4);   break; }
      }
    }
    SetNormalAndDirection();
    m_fWaitTime = 15.0f + FRnd()*2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_fDepthSortOffset = -0.1f;
    ParentToNearestPolygonAndStretch();
  }


  // goo stain on wall/floor
  void GooStain(void)
  {
    // readout blood type
    const INDEX iBloodType = GetSP()->sp_iBlood;
    if( iBloodType<1) { return; }

    Stretch();
    SetModel(MODEL_BLOOD_STAIN);
    if( iBloodType==3) {
      // flower mode! :)
      SetModelColor( RGBAToColor( 255,255,255,255));
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER2);  break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER3);  break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      }
    } else {
      SetModelColor( RGBAToColor( 0,128,12,0));
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN1);   break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN2);   break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_STAIN3);   break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_STAIN4);   break; }
      }
    }
    SetNormalAndDirection();
    m_fWaitTime = 15.0f + FRnd()*2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    m_fDepthSortOffset = -0.1f;
    ParentToNearestPolygonAndStretch();
  }


  // bullet exit wound blood on wall/floor
  void BloodSpill(COLOR colBloodSpillColor)
  {
    // readout blood type
    const INDEX iBloodType = GetSP()->sp_iBlood;
    if( iBloodType<1) { return; }

    Stretch();
    SetModel(MODEL_BLOOD_STAIN);
    if( iBloodType==3) {
      // flower mode! :)
      SetModelColor( RGBAToColor( 255,255,255,255));
      switch( IRnd()&3) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER2);  break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_FLOWER3);  break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_FLOWER1);  break; }
      }
    } else {
      switch( IRnd()%5) {
      case 1:  { SetModelMainTexture(TEXTURE_BLOOD_SPILL1); break; }
      case 2:  { SetModelMainTexture(TEXTURE_BLOOD_SPILL2); break; }
      case 3:  { SetModelMainTexture(TEXTURE_BLOOD_SPILL1); break; }
      case 4:  { SetModelMainTexture(TEXTURE_BLOOD_SPILL2); break; }
      default: { SetModelMainTexture(TEXTURE_BLOOD_SPILL3); break; }
      }
      if( iBloodType==2)
      {
        SetModelColor( colBloodSpillColor);
      }
      else               { SetModelColor( RGBAToColor( 0,250,0,255)); }
    }
    SetNormalAndDirection();
    m_fWaitTime = 15.0f + FRnd()*2.0f;
    m_fFadeTime = 2.0f;
    m_bLightSource = FALSE;
    ParentToNearestPolygonAndStretch();
  }

procedures:


/************************************************************
 *                    M  A  I  N                            *
 ************************************************************/

  Main(ESpawnEffect eSpawn)
  {
    if(eSpawn.betType==BET_GIZMO_SPLASH_FX ||
       eSpawn.betType==BET_FLESH_SPLAT_FX ||
       eSpawn.betType==BET_BONE_SPLAT_FX ||
       eSpawn.betType==BET_SPIDER_SPLAT_FX ||
       eSpawn.betType==BET_FLOATER_SPLAT_FX ||
       eSpawn.betType==BET_HAMMER_FLESH ||
       eSpawn.betType==BET_HAMMER_METAL ||
       eSpawn.betType==BET_HAMMER_ROCK ||
       eSpawn.betType==BET_HAMMER_WOOD ||
       eSpawn.betType==BET_HAMMER_GENERIC ||
       eSpawn.betType==BET_SAW ||
       eSpawn.betType==BET_SAW_FLESH ||
       eSpawn.betType==BET_ARROWHIT ||
       eSpawn.betType==BET_EXPLOSION_DEBRIS ||
       eSpawn.betType==BET_EXPLOSION_SMOKE ||
       eSpawn.betType==BET_SUMMONERSTAREXPLOSION  ||
       eSpawn.betType==BET_COLLECT_ENERGY ||
       eSpawn.betType==BET_GROWING_SWIRL||
       eSpawn.betType==BET_MANTAMAN||
       eSpawn.betType==BET_DISAPPEAR_DUST||
	     /*eSpawn.betType==BET_SNIPER_RESIDUE ||*/
       eSpawn.betType==BET_DUST_FALL)
    {
      InitAsEditorModel();
    }
    else
    {
      InitAsModel();
    }
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
    SetFlags(GetFlags() | ENF_SEETHROUGH);

    // set appearance
    m_tmSpawn = _pTimer->CurrentTick();
    m_vNormal = eSpawn.vNormal;
    m_vDirection = eSpawn.vDirection;
    m_vStretch = eSpawn.vStretch;
    m_betType = eSpawn.betType;
    m_colMultiplyColor = eSpawn.colMuliplier;
    
    switch (m_betType) {
      case BET_ROCKET: ProjectileExplosion(); break;
      case BET_ROCKET_PLANE: ProjectilePlaneExplosion(); break;
      case BET_GRENADE: GrenadeExplosion(); break;
      case BET_GRENADE_PLANE: GrenadePlaneExplosion(); break;
      case BET_EXPLOSIONSTAIN: Stain(); break;
      case BET_SHOCKWAVE: ShockWave(); break;
      case BET_LASERWAVE: LaserWave(); break;
      case BET_BULLETTRAIL: BulletTrail(); break;
      case BET_BULLETSTAINSAND: BulletStainSand(TRUE); break;
      case BET_BULLETSTAINREDSAND: BulletStainRedSand(TRUE); break;
      case BET_BULLETSTAINSTONE: BulletStainStone(TRUE, TRUE); break;
      case BET_BULLETSTAINWATER: BulletStainWater(TRUE); break;
      case BET_BULLETSTAINUNDERWATER: BulletStainStone(TRUE, FALSE); break;
      case BET_BULLETSTAINSANDNOSOUND: BulletStainSand(FALSE); break;
      case BET_BULLETSTAINREDSANDNOSOUND: BulletStainRedSand(FALSE); break;
      case BET_BULLETSTAINSTONENOSOUND: BulletStainStone(FALSE, TRUE); break;
      case BET_BULLETSTAINWATERNOSOUND: BulletStainWater(FALSE); break;
      case BET_BULLETSTAINUNDERWATERNOSOUND: BulletStainStone(FALSE, FALSE); break;
      case BET_BLOODSPILL: BloodSpill(m_colMultiplyColor); break;
      case BET_BLOODSTAIN: BloodStain(); break;
      case BET_GIZMOSTAIN: GizmoStain(); break;
      case BET_BLOODSTAINGROW: BloodStainGrow(); break;
      case BET_BLOODEXPLODE: BloodExplode(); break;
      case BET_CANNON: CannonExplosion(FALSE, FALSE); break;
      case BET_CANNON_NOLIGHT: CannonExplosion(TRUE, TRUE); break;
      case BET_LIGHT_CANNON: CannonExplosion(TRUE, FALSE); break;
      case BET_CANNON_PLANE: CannonPlaneExplosion(); break;
      case BET_CANNONEXPLOSIONSTAIN: CannonStain(); break;
      case BET_CANNONSHOCKWAVE: CannonShockWave(); break;
      case BET_TELEPORT: TeleportEffect(); break;
      case BET_BOMB: BombExplosion(); break;
      case BET_GIZMO_SPLASH_FX: GizmoSplashFX(); break;
      case BET_BULLETSTAINGRASS: BulletStainGrass(TRUE); break;
      case BET_BULLETSTAINGRASSNOSOUND: BulletStainGrass(FALSE); break;
      case BET_BULLETSTAINWOOD: BulletStainWood(TRUE); break;
      case BET_BULLETSTAINWOODNOSOUND: BulletStainWood(FALSE); break;
      case BET_EXPLOSION_DEBRIS: ExplosionDebris(); break;
      case BET_COLLECT_ENERGY: CollectEnergy(); break;
      /*case BET_SNIPER_RESIDUE: SniperResidue(); break;*/
      case BET_EXPLOSION_SMOKE: ExplosionSmoke(); break;
      case BET_SUMMONERSTAREXPLOSION: SummonerStarExplosion(); break;
      case BET_GROWING_SWIRL: GrowingSwirl(); break;
      case BET_MANTAMAN: MantaAttack(); break;
      case BET_DISAPPEAR_DUST: DisappearDust(); break;
      case BET_DUST_FALL: DustFall(); break;
      case BET_BULLETSTAINSNOW: BulletStainSnow(TRUE); break;
      case BET_BULLETSTAINSNOWNOSOUND: BulletStainSnow(FALSE); break;
      case BET_PLASMA_EXPLOSION: PlasmaExplosion(); break;
      case BET_HYDROGUN: HydroExplosion(); break;

      case BET_FLESH_SPLAT_FX: FleshSplatFX(); break;
      case BET_BONE_SPLAT_FX: BoneSplatFX(); break;
      case BET_SPIDER_SPLAT_FX: SpiderSplatFX(); break;
      case BET_FLOATER_SPLAT_FX: FloaterSplatFX(); break;
      case BET_ARROWHIT: ArrowHitFX(); break;
      case BET_GOOSTAIN: GooStain(); break;
      case BET_BULLETSTAINLAVA: BulletStainLava(TRUE); break;
      case BET_BULLETSTAINLAVANOSOUND: BulletStainLava(FALSE); break;
      case BET_BULLETSTAINACID: BulletStainAcid(TRUE); break;
      case BET_BULLETSTAINACIDNOSOUND: BulletStainAcid(FALSE); break;
      case BET_BULLETSTAINGLASS: BulletStainGlass(TRUE); break;
      case BET_BULLETSTAINGLASSNOSOUND: BulletStainGlass(FALSE); break;
      case BET_BULLETSTAINFLESH: BulletStainFlesh(TRUE); break;
      case BET_BULLETSTAINFLESHNOSOUND: BulletStainFlesh(FALSE); break;
      case BET_BULLETSTAINMETAL: BulletStainMetal(TRUE); break;
      case BET_BULLETSTAINMETALNOSOUND: BulletStainMetal(FALSE); break;
      case BET_BULLETSTAINENERGY: BulletStainEnergy(TRUE); break;
      case BET_BULLETSTAINENERGYNOSOUND: BulletStainEnergy(FALSE); break;
      case BET_TELEPORT_REVERSE: TeleportReverseEffect(); break;
      case BET_GASCLOUD: GasCloud(); break;
      case BET_T3DGMX: T3DGMX(); break;
      case BET_HIVEBRAIN: HiveBrain(); break;

      case BET_HAMMER_FLESH: HammerFlesh(); break;
      case BET_HAMMER_METAL: HammerMetal(); break;
      case BET_HAMMER_ROCK: HammerRock(); break;
      case BET_HAMMER_WOOD: HammerWood(); break;
      case BET_HAMMER_GENERIC: HammerGeneric(); break;
      case BET_SAW: Saw(); break;
      case BET_SAW_FLESH: SawFlesh(); break;
      default:
        ASSERTALWAYS("Unknown effect type");
    }

    // setup light source
    if (m_bLightSource) { SetupLightSource(); }

    wait() {
      on (EBegin) : { call EffectLoop(); }
      on (EBrushDestroyed) : { stop; }
      on (EStop) : { stop; }
      on (EReturn) : { stop; }
    }

    // cease to exist
    Destroy();
    return;
  }


  // standard effect loop
  EffectLoop() 
  {
    // wait
    if (m_fWaitTime>0.0f) {
      autowait(m_fWaitTime);
    }
    // fading
    if (m_fFadeTime>0.0f) {
      m_fFadeStartTime  = _pTimer->CurrentTick();
      m_fFadeStartAlpha = ((GetModelColor()&CT_AMASK)>>CT_ASHIFT) / 255.0f;
      m_bFade = TRUE;
      autowait(m_fFadeTime);
      m_bFade = FALSE;
    }
    
    // wait for sound to end
    if (m_fSoundTime > m_fWaitTime+m_fFadeTime) {
      SwitchToEditorModel();
      autowait(m_fSoundTime - (m_fWaitTime+m_fFadeTime));
    }

    if (m_tmWaitAfterDeath>0.0f) {
      if( en_RenderType != RT_EDITORMODEL)
      {
        SwitchToEditorModel();
      }
      autowait(m_tmWaitAfterDeath);
    }

    return EReturn();
  }

};
