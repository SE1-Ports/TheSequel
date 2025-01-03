323
%{
#include "StdH.h"
#include "Models/Enemies/Headman/Projectile/Bomb.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/Projectile";

// type of debris
enum DebrisType {
  1 DT_STONE "Stone",
  2 DT_FLESH_RED  "Flesh red",
  3 DT_FLESH_GREEN  "Flesh green",
  4 DT_FLESH_YELLOW  "Flesh yellow",
  5 DT_ROBOT  "Robot",
  6 DT_NONE   "None",
  7 DT_HIPPY  "Hippy",
};

enum CecDeath {
  0 CEC_FALL       "Fall Down",
  1 CEC_SPLODE      "Explode",
};

enum ParticleTrailType {
  0 TRAIL_NONE              "None",
  1 TRAIL_ROMBOID           "Romboid trail",
  2 TRAIL_BOMB              "Bomb trail",
  3 TRAIL_FIRECRACKER       "Firecracker trail",
  4 TRAIL_COLOREDSTARS      "Colored stars",
  5 TRAIL_FIREBALL          "Fireball trail",
  6 TRAIL_GRENADE           "Grenade trail",
  7 TRAIL_CANNON            "Cannon trail",
  8 TRAIL_ROCKET            "Rocket trail",
  9 TRAIL_BLOOD             "Blood trail",
 10 TRAIL_LAVA              "Lava trail",
 12 TRAIL_LAVABOMB          "Lava bomb trail",
 16 TRAIL_BEAST             "Beast projectile trail",
 17 TRAIL_BEASTBIG          "Beast big projectile trail",
 18 TRAIL_BEASTDEBRIS       "Beast debris trail",
 20 TRAIL_AFTERBURNER       "Afterburner trail",
 22 TRAIL_SPIRAL            "Spiral trail",
 24 TRAIL_RUNNINGDUST       "Running dust",
};

%{
// info structure
static EntityInfo eiCec = {
  EIBT_FLESH, 14000.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};

#define CEC_MAX_TA 10
FLOAT cecTriggerArray[CEC_MAX_TA] = { 0.9f, 0.8f, 0.7f, 0.6f, 0.5f,
                                         0.4f, 0.3f, 0.2f, 0.1f, 0.05f };
#define FIRE_POS      FLOAT3D(0.0f, 0.0f, 0.0f)
%}


class CCustomEnemyCollision : CEnemyFly {
name      "CustomEnemyCollision";
thumbnail "Thumbnails\\CEC.tbn";

properties:
  1 FLOAT m_fHealth            "Health" = 100.0f,
  2 BOOL m_bInvisible "Invisible" 'I'=FALSE,
  4 enum SprayParticlesType m_penSpray "Blood Type" = SPT_BLOOD, // type of particles
  5 FLOAT m_iCecScore                  "Score" = 100.0f,
  6 FLOAT m_iCecSpeed                  "Speed" = 10.0f,
  7 enum CecDeath m_CecDeath "Death type" 'D' = CEC_FALL,
  
 20 CEntityPointer m_penTrigger01 "Health 90% Trigger" ,
 21 CEntityPointer m_penTrigger02 "Health 80% Trigger" ,
 22 CEntityPointer m_penTrigger03 "Health 70% Trigger" ,
 23 CEntityPointer m_penTrigger04 "Health 60% Trigger" ,
 24 CEntityPointer m_penTrigger05 "Health 50% Trigger" ,
 25 CEntityPointer m_penTrigger06 "Health 40% Trigger" ,
 26 CEntityPointer m_penTrigger07 "Health 30% Trigger" ,
 27 CEntityPointer m_penTrigger08 "Health 20% Trigger" ,
 28 CEntityPointer m_penTrigger09 "Health 10% Trigger" ,
 29 CEntityPointer m_penTrigger10 "Health 05% Trigger" ,

 30 enum ParticleTrailType m_ptType "Particle trail"    'T' = TRAIL_NONE,
 31 BOOL m_bRenderParticles=FALSE,
 32 FLOAT m_fStartTime = 0.0f,               // start time when launched

 33 BOOL  m_bInvulnerable  "Invulnerable" 'V'  = FALSE, // can we be hurt?

 34 FLOAT m_fStretchAll     "StretchAll" 'S' = 10.0f,
 35 FLOAT m_fStretchX       "StretchX"   'X' = 1.0f,
 36 FLOAT m_fStretchY       "StretchY"   'Y' = 1.0f,
 37 FLOAT m_fStretchZ       "StretchZ"   'Z' = 1.0f,

 41 FLOAT fSpeedRatio          "Particle Speed ratio" = 1.0f,
 42 FLOAT fZOffset             "Particle ZOffset" = 0.0f,
 43 FLOAT fYOffset             "Particle YOffset" = 0.0f,
 44 FLOAT ctParticles          "Particle count" = 32.0f,
 45 FLOAT fHeight              "Particle Height" = 0.0f,
 46 FLOAT m_fSize              "Particle Size"  = 1.0f,

 47 BOOL m_bCecShoot                "Shooter" 'S' = FALSE,
 48 enum ProjectileType m_prtType   "Projectile" 'P' = PRT_LAVA_COMET,
 49 FLOAT m_iCecShootSpeed          "Shoot Speed" = 1.0f,
 50 FLOAT m_fCecShootAngle          "Shoot Angle" 'A' = 45.0f,
 51 BOOL m_bCecShootInArc           "Shoot In Arc" 'I' = FALSE,
 52 FLOAT m_iCecShootDistance       "Shoot Distance" = 100.0f,
 72 FLOAT m_fCecShootHeight         "Shoot Height" 'H' = 0.0f,

 53 CTFileName m_fnSoundIdle    "Sound File Idle"     = CTFILENAME("Sounds\\Misc\\Silence.wav"),
 54 CTFileName m_fnSoundSight   "Sound File Sight"    = CTFILENAME("Sounds\\Misc\\Silence.wav"),
 55 CTFileName m_fnSoundWound   "Sound File Wound"    = CTFILENAME("Sounds\\Misc\\Silence.wav"),
 56 CTFileName m_fnSoundTaunt   "Sound File Taunt"    = CTFILENAME("Sounds\\Misc\\Silence.wav"),
 57 CTFileName m_fnSoundDeath   "Sound File Death"    = CTFILENAME("Sounds\\Misc\\Silence.wav"),
 58 CTFileName m_fnSoundFire    "Sound File Fire"     = CTFILENAME("Sounds\\Misc\\Silence.wav"),
 59 RANGE m_rFallOffRange  "Sound Fall-off" 'F' = 80.0f,
 60 RANGE m_rHotSpotRange  "Sound Hot-spot" 'H' =  5.0f,
 61 FLOAT m_fVolume        "Sound Volume"   'V' = 1.0f,
 62 FLOAT m_fPitch         "Sound Pitch"   'P' = 1.0f,
 63 FLOAT m_iCecWound      "Damage Wounded" = 1000000.0f,
 
 64 ANIMATION m_iCecAnimIdle  "Animation Idle" = 0,
 65 ANIMATION m_iCecAnimMove  "Animation Move" = 0,
 66 ANIMATION m_iCecAnimWound "Animation Wound" = 0,
 67 ANIMATION m_iCecAnimDeath "Animation Death" = 0,
 68 ANIMATION m_iCecAnimFire  "Animation Attack" = 0,
 71 ANIMATION m_iCecAnimTaunt "Animation Taunt" = 0,
 69 CTFileName m_CecModel      "Model" 'M' =CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl"),
 70 CTFileName m_CecTexture    "Texture" 'T' =CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.tex"),
 
 80 enum DebrisType m_dtDebris "Debris" 'D' = DT_NONE,  // type of debris
 81 FLOAT m_fCecBlowUpSize "Debris size" = 2.0f,
 82 FLOAT m_fCecBodyParts "Debris count" = 6.0f,


components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
  5 class   CLASS_PROJECTILE      "Classes\\Projectile.ecl",

// ************** FLESH PARTS **************
 10 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 11 model   MODEL_FLESH_APPLE    "Models\\Effects\\Debris\\Fruits\\Apple.mdl",
 12 model   MODEL_FLESH_BANANA   "Models\\Effects\\Debris\\Fruits\\Banana.mdl",
 13 model   MODEL_FLESH_BURGER   "Models\\Effects\\Debris\\Fruits\\CheeseBurger.mdl",
 14 model   MODEL_FLESH_LOLLY    "Models\\Effects\\Debris\\Fruits\\LollyPop.mdl",
 15 model   MODEL_FLESH_ORANGE   "Models\\Effects\\Debris\\Fruits\\Orange.mdl",

 20 texture TEXTURE_FLESH_RED    "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",
 21 texture TEXTURE_FLESH_GREEN  "Models\\Effects\\Debris\\Flesh\\FleshGreen.tex",
 22 texture TEXTURE_FLESH_APPLE  "Models\\Effects\\Debris\\Fruits\\Apple.tex",       
 23 texture TEXTURE_FLESH_BANANA "Models\\Effects\\Debris\\Fruits\\Banana.tex",      
 24 texture TEXTURE_FLESH_BURGER "Models\\Effects\\Debris\\Fruits\\CheeseBurger.tex",
 25 texture TEXTURE_FLESH_LOLLY  "Models\\Effects\\Debris\\Fruits\\LollyPop.tex",
 26 texture TEXTURE_FLESH_ORANGE "Models\\Effects\\Debris\\Fruits\\Orange.tex",
 27 texture TEXTURE_FLESH_YELLOW  "ModelsF\\Effects\\Debris\\Flesh\\FleshYellow.tex",

// ************** MACHINE PARTS **************
 31 model   MODEL_MACHINE        "Models\\Effects\\Debris\\Stone\\Stone.mdl",
 32 texture TEXTURE_MACHINE      "Models\\Effects\\Debris\\Stone\\Stone.tex",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s was killed by a something"), strPlayerName);
    return str;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheClass(CLASS_PROJECTILE, m_prtType);
    PrecacheModel(MODEL_FLESH);
    PrecacheModel(MODEL_FLESH_APPLE);
    PrecacheModel(MODEL_FLESH_BANANA);
    PrecacheModel(MODEL_FLESH_BURGER);
    PrecacheModel(MODEL_FLESH_LOLLY);
    PrecacheModel(MODEL_FLESH_ORANGE);
    PrecacheModel(MODEL_MACHINE);
    PrecacheTexture(TEXTURE_MACHINE);
    PrecacheTexture(TEXTURE_FLESH_RED);
    PrecacheTexture(TEXTURE_FLESH_GREEN);
    PrecacheTexture(TEXTURE_FLESH_APPLE); 
    PrecacheTexture(TEXTURE_FLESH_BANANA);
    PrecacheTexture(TEXTURE_FLESH_BURGER);
    PrecacheTexture(TEXTURE_FLESH_LOLLY); 
    PrecacheTexture(TEXTURE_FLESH_ORANGE); 
  };

  /* Entity info */
  void *GetEntityInfo(void)
  {
    return &eiCec;
  };

  /* Get anim data for given animation property - return NULL for none. */
  CAnimData *GetAnimData(SLONG slPropertyOffset) 
  {
    if (slPropertyOffset==offsetof(CCustomEnemyCollision, m_iCecAnimIdle)) {
      return GetModelObject()->GetData();
    } else if (slPropertyOffset==offsetof(CCustomEnemyCollision, m_iCecAnimMove)) {
      return GetModelObject()->GetData();
    } else if (slPropertyOffset==offsetof(CCustomEnemyCollision, m_iCecAnimWound)) {
      return GetModelObject()->GetData();
    } else if (slPropertyOffset==offsetof(CCustomEnemyCollision, m_iCecAnimDeath)) {
      return GetModelObject()->GetData();
    } else if (slPropertyOffset==offsetof(CCustomEnemyCollision, m_iCecAnimFire)) {
      return GetModelObject()->GetData();
    } else if (slPropertyOffset==offsetof(CCustomEnemyCollision, m_iCecAnimTaunt)) {
      return GetModelObject()->GetData();
    } else {
      return CEntity::GetAnimData(slPropertyOffset);
    }
  };

  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    CEnemyBase::FillEntityStatistics(pes);
    if (m_bInvisible) {
      pes->es_strName+=" Invisible";
    }
    return TRUE;
  }

  // render particles
  void RenderParticles(void)
  {
    if(m_ptType==TRAIL_NONE ) {
	  m_bRenderParticles = FALSE;
	}
    if(m_ptType==TRAIL_ROMBOID ) {
	  m_bRenderParticles = TRUE;
       Particles_RomboidTrail(this);
	}
    if(m_ptType==TRAIL_BOMB ) {
	  m_bRenderParticles = TRUE;
       Particles_BombTrail(this);
	}
    if(m_ptType==TRAIL_FIRECRACKER ) {
	  m_bRenderParticles = TRUE;
       Particles_FirecrackerTrail(this);
	}
    if(m_ptType==TRAIL_COLOREDSTARS ) {
	  m_bRenderParticles = TRUE;
       Particles_ColoredStarsTrail(this);
	}
    if(m_ptType==TRAIL_FIREBALL ) {
	  m_bRenderParticles = TRUE;
       Particles_Fireball01Trail(this);
	}
    if(m_ptType==TRAIL_GRENADE ) {
	  m_bRenderParticles = TRUE;
       Particles_GrenadeTrail(this);
	}
    if(m_ptType==TRAIL_CANNON ) {
	  m_bRenderParticles = TRUE;
       Particles_CannonBall(this, fSpeedRatio);
	}
    if(m_ptType==TRAIL_BLOOD ) {
	  m_bRenderParticles = TRUE;
       Particles_BloodTrail(this);
	}
    if(m_ptType==TRAIL_ROCKET ) {
	  m_bRenderParticles = TRUE;
       Particles_RocketTrail(this, m_fSize);
	}
    if(m_ptType==TRAIL_LAVA ) {
	  m_bRenderParticles = TRUE;
       Particles_LavaTrail(this);
	}
    if(m_ptType==TRAIL_LAVABOMB ) {
	  m_bRenderParticles = TRUE;
       Particles_LavaBombTrail(this, m_fSize);
	}
    if(m_ptType==TRAIL_BEAST ) {
	  m_bRenderParticles = TRUE;
       Particles_BeastProjectileTrail( this, m_fSize, fHeight, ctParticles);
	}
    if(m_ptType==TRAIL_BEASTBIG ) {
	  m_bRenderParticles = TRUE;
       Particles_BeastBigProjectileTrail( this, m_fSize, fZOffset, fYOffset, ctParticles);
	}
    if(m_ptType==TRAIL_BEASTDEBRIS ) {
	  m_bRenderParticles = TRUE;
       Particles_BeastProjectileDebrisTrail(this, m_fSize);
	}
    if(m_ptType==TRAIL_AFTERBURNER ) {
	  m_bRenderParticles = TRUE;
       Particles_AfterBurner( this, m_fStartTime, m_fSize);
	}
    if(m_ptType==TRAIL_SPIRAL ) {
	  m_bRenderParticles = TRUE;
       Particles_SpiralTrail(this);
	}
    if(m_ptType==TRAIL_RUNNINGDUST ) {
	  m_bRenderParticles = TRUE;
       Particles_RunningDust(this);
	}
  }

  /* Adjust model shading parameters if needed. */
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    // no shadows for invisibles
    if (m_bInvisible) {
      colAmbient = C_WHITE;
      return FALSE;
    } else {
      return CEnemyBase::AdjustShadingParameters(vLightDirection, colLight, colAmbient);
    }
  }

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(BOMB_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // Receive damage
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {    
    
    // while we are invulnerable, receive no damage
    if (m_bInvulnerable) {
      return;
    }

    FLOAT fOldHealth = GetHealth();
    CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    FLOAT fNewHealth = GetHealth();

    CEntityPointer *penTrigger = &m_penTrigger01;
    // see if any triggers have to be set
    for (INDEX i=0; i<CEC_MAX_TA; i++) {
      FLOAT fHealth = cecTriggerArray[i]*m_fMaxHealth;
      // triggers
      if (fHealth<=fOldHealth && fHealth>fNewHealth)
      {
        if (&*penTrigger[i]) {
          SendToTarget(&*penTrigger[i], EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        }
      }
    }
   }

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage)
  {
    StartModelAnim(m_iCecAnimWound, 0);
    return m_iCecAnimWound;
  };

  INDEX AnimForDeath(void) {
    StartModelAnim(m_iCecAnimDeath, 0);
    return m_iCecAnimDeath;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(m_iCecAnimIdle, AOF_LOOPING|AOF_NORESTART);
  };
  void WalkingAnim(void) {
    StartModelAnim(m_iCecAnimMove, AOF_LOOPING|AOF_NORESTART);
  };
  void RunningAnim(void) {
    StartModelAnim(m_iCecAnimMove, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    StartModelAnim(m_iCecAnimMove, AOF_LOOPING|AOF_NORESTART);
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, m_fnSoundIdle, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, m_fnSoundSight, SOF_3D);
  };
  void TauntSound(void) {
    PlaySound(m_soSound, m_fnSoundTaunt, SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, m_fnSoundWound, SOF_3D);
   };
  void DeathSound(void) {
    PlaySound(m_soSound, m_fnSoundDeath, SOF_3D);
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soSound.Set3DParameters(FLOAT(m_rFallOffRange), FLOAT(m_rHotSpotRange), m_fVolume, m_fPitch);
  };


/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  //DON'T spawn body parts
  void BlowUp(void) {
    // blow up notify
    BlowUpNotify();

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());
    vNormalizedDamage *= 0.75f;
    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

    if(m_dtDebris==DT_NONE ) {
    // hide yourself
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL); }
    if(m_dtDebris==DT_ROBOT ) {
      // determine debris texture (color)
      ULONG ulFleshTexture = TEXTURE_MACHINE;
      ULONG ulFleshModel   = MODEL_MACHINE;
      // spawn debris
      Debris_Begin(EIBT_ROBOT, DPR_SMOKETRAIL, BET_EXPLOSIONSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, MODEL_MACHINE, TEXTURE_MACHINE, 0, 0, 0, IRnd()%4, 0.2f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
      }
      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_BOMB;
      FLOAT fSize = m_fBlowUpSize*0.3f;
      eSpawnEffect.vStretch = FLOAT3D(fSize,fSize,fSize);
      penExplosion->Initialize(eSpawnEffect);
    }
    if(m_dtDebris==DT_FLESH_RED ) {
      // determine debris texture (color)
      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;
      // spawn debris
      Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
      }

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_FLESH_SPLAT_FX;
      penSplat->Initialize(ese);

      // leave a stain beneath
      LeaveStain(FALSE);
    }
    if(m_dtDebris==DT_FLESH_GREEN ) {
      // determine debris texture (color)
      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;
      // spawn debris
      Debris_Begin(EIBT_FLESH, DPT_SLIMETRAIL, BET_GIZMOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
      }

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_FLESH_SPLAT_FX;
      penSplat->Initialize(ese);

      // leave a stain beneath
      LeaveStain(FALSE);
    }
    if(m_dtDebris==DT_FLESH_YELLOW ) {
      // determine debris texture (color)
      ULONG ulFleshTexture = TEXTURE_FLESH_YELLOW;
      ULONG ulFleshModel   = MODEL_FLESH;
      // spawn debris
      Debris_Begin(EIBT_FLESH, DPT_GOOTRAIL, BET_GOOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
      }

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_FLESH_SPLAT_FX;
      penSplat->Initialize(ese);

      // leave a stain beneath
      LeaveStain(FALSE);
    }
    if(m_dtDebris==DT_STONE ) {
      // determine debris texture (color)
      ULONG ulFleshTexture = TEXTURE_MACHINE;
      ULONG ulFleshModel   = MODEL_MACHINE;
      // spawn debris
      Debris_Begin(EIBT_ROCK, DPT_NONE, BET_NONE, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
      }

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_EXPLOSION_DEBRIS;
      penSplat->Initialize(ese);

      // leave a stain beneath
      LeaveStain(FALSE);
    }
    if(m_dtDebris==DT_HIPPY ) {
      // determine debris texture (color)
      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;
      // spawn debris
      Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_NONE, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
          switch( IRnd()%5) {
          case 1:  { ulFleshModel = MODEL_FLESH_APPLE;   ulFleshTexture = TEXTURE_FLESH_APPLE;   break; }
          case 2:  { ulFleshModel = MODEL_FLESH_BANANA;  ulFleshTexture = TEXTURE_FLESH_BANANA;  break; }
          case 3:  { ulFleshModel = MODEL_FLESH_BURGER;  ulFleshTexture = TEXTURE_FLESH_BURGER;  break; }
          case 4:  { ulFleshModel = MODEL_FLESH_LOLLY;   ulFleshTexture = TEXTURE_FLESH_LOLLY;   break; }
          default: { ulFleshModel = MODEL_FLESH_ORANGE;  ulFleshTexture = TEXTURE_FLESH_ORANGE;  break; }
          }
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
      }

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_FLESH_SPLAT_FX;
      penSplat->Initialize(ese);

      // leave a stain beneath
      LeaveStain(FALSE);
    }

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };

/************************************************************
 *                     MOVING FUNCTIONS                     *
 ************************************************************/
  // check whether may move while attacking
  BOOL MayMoveToAttack(void) 
  {
    if (m_bInAir) {
      return WouldNotLeaveAttackRadius();
    } else {
      return CEnemyBase::MayMoveToAttack();
    }
  }


procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  FlyFire(EVoid) : CEnemyFly::FlyFire {
   if (m_bCecShoot == TRUE) {
    if (m_bCecShootInArc == TRUE) {

    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, FLOAT3D(0.0f, m_fCecShootHeight, 0.0f)(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      m_fCecShootAngle,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FLOAT3D(0.0f, m_fCecShootHeight, 0.0f), ANGLE3D(0, m_fCecShootAngle, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = m_prtType;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    StartModelAnim(m_iCecAnimFire, 0);
    PlaySound(m_soSound, m_fnSoundFire, SOF_3D);

	} else {

    StartModelAnim(m_iCecAnimFire, 0);
    ShootProjectile(m_prtType, FLOAT3D(0.0f, m_fCecShootHeight, 0.0f), ANGLE3D(0, 0, 0));

    StartModelAnim(m_iCecAnimFire, 0);
    PlaySound(m_soSound, m_fnSoundFire, SOF_3D);

	}
    autowait(GetModelObject()->GetAnimLength(m_iCecAnimFire));
    return EReturn();
   }
   else { 
    return EReturn(); }
  };

  GroundFire(EVoid) : CEnemyFly::GroundFire {
   if (m_bCecShoot == TRUE) {
    if (m_bCecShootInArc == TRUE) {

    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, FLOAT3D(0.0f, m_fCecShootHeight, 0.0f)(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      m_fCecShootAngle,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FLOAT3D(0.0f, m_fCecShootHeight, 0.0f), ANGLE3D(0, m_fCecShootAngle, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = m_prtType;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    StartModelAnim(m_iCecAnimFire, 0);
    PlaySound(m_soSound, m_fnSoundFire, SOF_3D);

	} else {

    ShootProjectile(m_prtType, FLOAT3D(0.0f, m_fCecShootHeight, 0.0f), ANGLE3D(0, 0, 0));

    StartModelAnim(m_iCecAnimFire, 0);
    PlaySound(m_soSound, m_fnSoundFire, SOF_3D); 

	}
    autowait(GetModelObject()->GetAnimLength(m_iCecAnimFire));
    return EReturn();
   }
   else { 
    return EReturn(); }
  };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
	m_bRenderParticles = FALSE;
	m_ptType = TRAIL_NONE;
	if (m_CecDeath == CEC_FALL) {
      autocall CEnemyBase::Death() EEnd;
	  }
	if (m_CecDeath == CEC_SPLODE) {
      BlowUp();
	  }
    return EEnd();
  };
/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {

    // must not crash when model is removed
    if (m_CecModel=="") {
      m_CecModel=CTFILENAME("Models\\Enemies\\Headman\\Projectile\\Bomb.mdl");
    }

    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_fDensity = 1000;
    m_fBlowUpSize = m_fCecBlowUpSize;
	m_bRenderParticles = m_bRenderParticles;

    // set your appearance
    SetModel(m_CecModel);
    SetModelMainTexture(m_CecTexture);
    if (m_bInvisible) {
      GetModelObject()->mo_colBlendColor = C_WHITE|0x0;
	  }
    // setup moving speed
    m_fWalkSpeed = m_iCecSpeed;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
    m_fAttackRunSpeed = m_iCecSpeed;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
    m_fCloseRunSpeed = m_iCecSpeed;
    m_aCloseRotateSpeed = AngleDeg(360.0f);
	// setup attack distances
    m_fAttackDistance = m_iCecShootDistance;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 1.5f;
    m_fAttackFireTime = m_iCecShootSpeed;
    m_fCloseFireTime = m_iCecShootSpeed;
    m_fIgnoreRange = 2000.0f;
    // fly moving properties
    m_fFlyWalkSpeed = m_iCecSpeed;
    m_aFlyWalkRotateSpeed = FRnd()*20.0f + 600.0f;
    m_fFlyAttackRunSpeed = m_iCecSpeed;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 300.0f;
    m_fFlyCloseRunSpeed = m_iCecSpeed;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 300.0f;
    m_fGroundToAirSpeed = 2.5f;
    m_fAirToGroundSpeed = 2.5f;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;
    m_fFlyHeight = 1.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = m_iCecShootDistance;
    m_fFlyCloseDistance = 0.0f;
    m_fFlyStopDistance = 1.5f;
    m_fFlyAttackFireTime = m_iCecShootSpeed;
    m_fFlyCloseFireTime = m_iCecShootSpeed;
    m_fFlyIgnoreRange = 2000.0f;
    // damage/explode properties
	if (m_CecDeath == CEC_FALL) {
       m_fBlowUpAmount = 99999999999999.0f; }
	if (m_CecDeath == CEC_SPLODE) {
       m_fBlowUpAmount = 0.0f; }
    m_fBodyParts = m_fCecBodyParts;
    m_fDamageWounded = m_iCecWound;

     // properties that modify EnemyBase properties
    if (m_fHealth<=0.0f) { m_fHealth=1.0f; }
    SetHealth(m_fHealth); m_fMaxHealth = m_fHealth;
	m_iScore = m_iCecScore;
    m_sptType = m_penSpray;

    en_fDeceleration = 150.0f;

    // set stretch factors for height and width
    // set model stretch -- MUST BE DONE BEFORE SETTING MODEL!
    GetModelObject()->mo_Stretch = FLOAT3D(
      m_fStretchAll*m_fStretchX,
      m_fStretchAll*m_fStretchY,
      m_fStretchAll*m_fStretchZ);
    ModelChangeNotify();
    StandingAnim();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};
