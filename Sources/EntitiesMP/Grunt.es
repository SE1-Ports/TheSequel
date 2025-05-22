343
%{
#include "StdH.h"
#include "ModelsMP/Enemies/Grunt/Grunt.h"
#include "ModelsF/Enemies/ZorgPro/ZorgPro.h"
#include "ModelsF/Enemies/ZorgPro/Gun.h"
#include "ModelsF/Enemies/ZorgPro/Blade.h"
#include "ModelsF/Enemies/ZorgPro/GunBarrel.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum GruntType {
  0 GT_SOLDIER    "Grunt soldier",
  1 GT_COMMANDER  "Grunt commander",
  2 GT_SNIPER     "Grunt sniper",
  3 GT_HEAVY      "Grunt heavy",
};

enum ComAtkType {
  0 COM_BOTH       "Laser and Bombs",
  1 COM_LASERS     "Lasers only",
  2 COM_BOMBS      "Bombs only",
};

%{
#define STRETCH_SOLDIER   1.2f
#define STRETCH_COMMANDER 1.4f
#define STRETCH_SNIPER    1.6f
#define STRETCH_HEAVY    1.8f
  
// info structure
static EntityInfo eiGruntSoldier = {
  EIBT_FLESH, 200.0f,
  0.0f, 1.9f*STRETCH_SOLDIER, 0.0f,     // source (eyes)
  0.0f, 1.3f*STRETCH_SOLDIER, 0.0f,     // target (body)
};

static EntityInfo eiGruntCommander = {
  EIBT_FLESH, 250.0f,
  0.0f, 1.9f*STRETCH_COMMANDER, 0.0f,     // source (eyes)
  0.0f, 1.3f*STRETCH_COMMANDER, 0.0f,     // target (body)
};

static EntityInfo eiGruntSniper = {
  EIBT_FLESH, 250.0f,
  0.0f, 1.9f*STRETCH_SNIPER, 0.0f,     // source (eyes)
  0.0f, 1.3f*STRETCH_SNIPER, 0.0f,     // target (body)
};

static EntityInfo eiGruntHeavy = {
  EIBT_FLESH, 250.0f,
  0.0f, 1.9f*STRETCH_HEAVY, 0.0f,     // source (eyes)
  0.0f, 1.3f*STRETCH_HEAVY, 0.0f,     // target (body)
};

#define FIREPOS_SOLDIER      FLOAT3D(0.07f, 1.36f, -0.78f)*STRETCH_SOLDIER
#define FIREPOS_COMMANDER_UP  FLOAT3D(0.09f, 1.45f, -0.62f)*STRETCH_COMMANDER
#define FIREPOS_COMMANDER_DN  FLOAT3D(0.10f, 1.30f, -0.60f)*STRETCH_COMMANDER
#define FIREPOS_SNIPER      FLOAT3D(0.07f, 1.36f, -0.78f)*STRETCH_SNIPER

#define FIREPOS_HEAVY1  FLOAT3D(0.3f, 1.0f, -0.62f)*STRETCH_HEAVY
#define FIREPOS_HEAVY2  FLOAT3D(0.3f, 0.8f, -0.62f)*STRETCH_HEAVY
#define FIREPOS_HEAVY3  FLOAT3D(0.6f, 1.0f, -0.62f)*STRETCH_HEAVY
#define FIREPOS_HEAVY4  FLOAT3D(0.6f, 0.8f, -0.62f)*STRETCH_HEAVY

#define FIREPOS_BOMB      FLOAT3D(-0.07f, 1.72f, -0.78f)
#define BOMB_ANGLE (20.0f)
%}


class CGrunt: CEnemyBase {
name      "Grunt";
thumbnail "Thumbnails\\Grunt.tbn";

properties:
  1 enum GruntType m_gtType "Type" 'Y' = GT_SOLDIER,
  2 INDEX m_iLoopCounter = 0,
  4 BOOL    m_bBeFriendlyFire  "Friendly Fire" 'F' = FALSE,
  5 INDEX   m_fgibTexture = TEXTURE_SOLDIER,

  10 CSoundObject m_soFire1,
  11 CSoundObject m_soFire2,
  12 CSoundObject m_soFire3,
  13 CSoundObject m_soFire4,

  15 BOOL m_bRenderElectricity = FALSE,                   // if electricity particles are rendered
  16 FLOAT3D m_vBeamSource = FLOAT3D( 0,0,0),      // position of electricity ray target
  17 FLOAT3D m_vBeamTarget = FLOAT3D( 0,0,0),      // position of electricity ray target
  18 FLOAT m_tmTemp = 0,
  
  19 enum ComAtkType m_ComAtkType "Commander Attack" 'A' = COM_BOTH,

// class internal
    
components:
  1 class   CLASS_BASE            "Classes\\EnemyBase.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 class   CLASS_PROJECTILE      "Classes\\Projectile.ecl",

 10 model   MODEL_GRUNT           "ModelsF\\Enemies\\ZorgPro\\ZorgPro.mdl",
 11 model   MODEL_GUN_COMMANDER   "ModelsMP\\Enemies\\Grunt\\Gun_Commander.mdl",
 12 model   MODEL_GUN_SOLDIER     "ModelsMP\\Enemies\\Grunt\\Gun.mdl",
 13 model   MODEL_GUN_SNIPER      "ModelsF\\Enemies\\Grunt\\Rifle.mdl",

 15 model   MODEL_GUN_HEAVY_BODY     "ModelsF\\Enemies\\ZorgPro\\GunBody.mdl",
 16 model   MODEL_GUN_HEAVY_BARREL   "ModelsF\\Enemies\\ZorgPro\\GunBarrel.mdl",
 17 texture TEXTURE_GUN_HEAVY        "ModelsF\\Enemies\\ZorgPro\\BodyGrey.tex",
 18 texture TEXTURE_GUN_HEAVY_BARREL "ModelsF\\Enemies\\ZorgPro\\BarrelGrey.tex",
 
 20 texture TEXTURE_SOLDIER       "ModelsMP\\Enemies\\Grunt\\Soldier.tex",
 21 texture TEXTURE_COMMANDER     "ModelsMP\\Enemies\\Grunt\\Commander.tex",
 25 texture TEXTURE_SNIPER        "ModelsF\\Enemies\\Grunt\\Grunt_GreenPurple.tex",
 26 texture TEXTURE_HEAVY         "ModelsF\\Enemies\\Grunt\\HDCommander.tex",
 22 texture TEXTURE_GUN_COMMANDER "ModelsMP\\Enemies\\Grunt\\Gun_Commander.tex",
 23 texture TEXTURE_GUN_SOLDIER   "ModelsMP\\Enemies\\Grunt\\Gun.tex",
 24 texture TEXTURE_GUN_SNIPER    "ModelsF\\Enemies\\Grunt\\Rifle.tex",

 27 model   MODEL_BLADE          "ModelsF\\Enemies\\ZorgPro\\Blade.mdl",
 28 texture TEXTURE_BLADE        "ModelsF\\Enemies\\ZorgPro\\Blade.tex",
 
 29 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Medium.tex",

 30 model   MODEL_DEBRIS_HEAD           "ModelsF\\Enemies\\Grunt\\Debris\\Hed.mdl",
 31 model   MODEL_DEBRIS_ARM           "ModelsF\\Enemies\\Grunt\\Debris\\Arm.mdl",
 32 model   MODEL_DEBRIS_LEG           "ModelsF\\Enemies\\Grunt\\Debris\\Leg.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",
 
// ************** SOUNDS **************
 50 sound   SOUND_IDLE            "ModelsMP\\Enemies\\Grunt\\Sounds\\Idle.wav",
 52 sound   SOUND_SIGHT           "ModelsMP\\Enemies\\Grunt\\Sounds\\Sight.wav",
 53 sound   SOUND_WOUND           "ModelsMP\\Enemies\\Grunt\\Sounds\\Wound.wav",
 57 sound   SOUND_FIRE            "ModelsMP\\Enemies\\Grunt\\Sounds\\Fire.wav",
 58 sound   SOUND_DEATH           "ModelsMP\\Enemies\\Grunt\\Sounds\\Death.wav",
 59 sound   SOUND_SNIPERFIRE      "ModelsF\\Enemies\\Grunt\\Sounds\\FireSeeker.wav",
 
 60 sound   SOUND_HEAVYFIRE      "ModelsF\\Enemies\\ZorgPro\\Sounds\\FireHeavy.wav",
 61 sound   SOUND_SHEATH         "ModelsF\\Enemies\\ZorgPro\\Sounds\\Sheath.wav",
 62 sound   SOUND_HIT            "ModelsF\\Enemies\\ZorgPro\\Sounds\\Hit.wav",
 63 sound   SOUND_THROW          "ModelsF\\Enemies\\ZorgPro\\Sounds\\Throw.wav",

functions:
    
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Grunt sent %s into the halls of Valhalla"), strPlayerName);
    return str;
  }

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_gtType==GT_SOLDIER) {
      return &eiGruntSoldier;
    } else if (m_gtType==GT_COMMANDER) {
      return &eiGruntSoldier;
    } else if (m_gtType==GT_SNIPER) {
      return &eiGruntSniper;
    } else if (m_gtType==GT_HEAVY) {
      return &eiGruntHeavy;
    }
  };

  // render particles
  void RenderParticles(void)
  {
    if( m_bRenderElectricity)
    {
      // calculate electricity ray source pos
      Particles_GreenLaser(this, m_vBeamSource, m_vBeamTarget, 0.1f);
    }

    CEnemyBase::RenderParticles();
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSoldier,     "DataMP\\Messages\\Enemies\\GruntSoldier.txt");
    static DECLARE_CTFILENAME(fnmCommander,   "DataMP\\Messages\\Enemies\\GruntCommander.txt");
    static DECLARE_CTFILENAME(fnmSniper,   "DataF\\Messages\\Enemies\\GruntSniper.txt");
    static DECLARE_CTFILENAME(fnmHeavy,    "DataF\\Messages\\Enemies\\GruntHeavy.txt");
    switch(m_gtType) {
    default: ASSERT(FALSE);
    case GT_SOLDIER:  return fnmSoldier;
    case GT_COMMANDER: return fnmCommander;
    case GT_SNIPER: return fnmSniper;
    case GT_HEAVY: return fnmHeavy;
    }
  };

  void Precache(void) {
    CEnemyBase::Precache();

    PrecacheModel(MODEL_GRUNT);
    PrecacheTexture(TEXTURE_SOLDIER);
    PrecacheTexture(TEXTURE_COMMANDER);
    PrecacheTexture(TEXTURE_SNIPER);
    PrecacheTexture(TEXTURE_HEAVY);

    PrecacheModel(MODEL_BLADE);
    PrecacheTexture(TEXTURE_BLADE);
    
    PrecacheModel(MODEL_GUN_SOLDIER);
    PrecacheTexture(TEXTURE_GUN_SOLDIER);
    PrecacheModel(MODEL_GUN_COMMANDER);
    PrecacheTexture(TEXTURE_GUN_COMMANDER);
    PrecacheModel(MODEL_GUN_SNIPER);
    PrecacheTexture(TEXTURE_GUN_SNIPER);
    PrecacheModel(MODEL_GUN_HEAVY_BODY);
    PrecacheTexture(TEXTURE_GUN_HEAVY);
    PrecacheModel(MODEL_GUN_HEAVY_BARREL);
    PrecacheTexture(TEXTURE_GUN_HEAVY_BARREL);

   if (m_gtType==GT_SOLDIER) {
      PrecacheClass(CLASS_PROJECTILE, PRT_GRUNT_PROJECTILE_SOL);
    }
    if (m_gtType==GT_COMMANDER) {
      PrecacheClass(CLASS_PROJECTILE, PRT_GRUNT_PROJECTILE_COM);
      PrecacheClass(CLASS_PROJECTILE, PRT_GRUNTBOMB);
    }
    if (m_gtType==GT_SNIPER) {
      PrecacheClass(CLASS_PROJECTILE, PRT_GRUNT_PROJECTILE_SNIPER);
    }
    if (m_gtType==GT_HEAVY) {
      PrecacheClass(CLASS_PROJECTILE, PRT_CYBORG_LASER);
    }

    PrecacheSound(SOUND_IDLE);
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_SNIPERFIRE);
	
    PrecacheSound(SOUND_HEAVYFIRE);
    PrecacheSound(SOUND_SHEATH);
    PrecacheSound(SOUND_HIT);
    PrecacheSound(SOUND_THROW);

    PrecacheModel(MODEL_DEBRIS_HEAD);
    PrecacheModel(MODEL_DEBRIS_ARM);
    PrecacheModel(MODEL_DEBRIS_LEG);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // friendly fire function
    if (!IsOfClass(penInflictor, "Grunt") ||
      ((CGrunt*)penInflictor)->m_bBeFriendlyFire!=FALSE) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
      // if died of chainsaw
      if (dmtType==DMT_CHAINSAW && GetHealth()<=0) {
        // must always blowup
        m_fBlowUpAmount = 0;
      }
  };

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    if(m_gtType==GT_HEAVY) {
      iAnim = ZORGPRO_ANIM_WOUND_HEAVY;
    } else {
      iAnim = ZORGPRO_ANIM_WOUND;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    FLOAT3D vFront;
    GetHeadingDirection(0, vFront);
    FLOAT fDamageDir = m_vDamage%vFront;
    if (fDamageDir<0) {
      iAnim = ZORGPRO_ANIM_DEATHBACK;
    } else {
      iAnim = ZORGPRO_ANIM_DEATHFORW;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    vStretch=FLOAT3D(1,1,2);
    if(GetModelObject()->GetAnim()==ZORGPRO_ANIM_DEATHBACK)
    {
      return 0.5f;
    }
    else if(GetModelObject()->GetAnim()==ZORGPRO_ANIM_DEATHFORW)
    {
      return 1.0f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(ZORGPRO_COLLISION_BOX_DEFAULT);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if(m_gtType==GT_HEAVY) {
      StartModelAnim(ZORGPRO_ANIM_IDLE_HEAVY, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(ZORGPRO_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void StandingAnimFight(void)
  {
    if(m_gtType==GT_HEAVY) {
      StartModelAnim(ZORGPRO_ANIM_IDLEFIGHT_HEAVY, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(ZORGPRO_ANIM_IDLEFIGHT, AOF_LOOPING|AOF_NORESTART);
    }
  }
  void RunningAnim(void) {
    if(m_gtType==GT_HEAVY) {
      StartModelAnim(ZORGPRO_ANIM_WALK_HEAVY, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(ZORGPRO_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    if(m_gtType==GT_HEAVY) {
      StartModelAnim(ZORGPRO_ANIM_WALK_HEAVY, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(ZORGPRO_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    WalkingAnim();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    // set sound default parameters
    if (m_bQuiet) { 
    m_soFire1.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
    m_soFire2.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
    m_soFire3.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
    m_soFire4.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
	} else {
    m_soFire1.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire2.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire3.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
    m_soFire4.Set3DParameters(160.0f, 50.0f, 1.0f, 1.0f);
	}
  };

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  // spawn body parts
  void BlowUp(void) {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_DEBRIS_HEAD, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
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

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    // soldier
    if (m_gtType == GT_SOLDIER) {
      autocall SoldierAttack() EEnd;
    // commander
    } else if (m_gtType == GT_COMMANDER) {
	  switch (m_ComAtkType) {
	   case COM_BOTH:
        switch (IRnd()%3) {
        case 0: jump CommanderAttack(); break;
        case 1: jump CommanderAttack(); break;
        case 2: jump CommanderBomb(); break;
		}
      break;
	 case COM_LASERS:
        jump CommanderAttack();
        break;
	 case COM_BOMBS:
        jump CommanderBomb();
        break;
	   }
    // sniper
    } else if (m_gtType == GT_SNIPER) {
      autocall SniperAttack() EEnd;
    // heavy
    } else if (m_gtType == GT_HEAVY) {
      autocall HeavyAttack() EEnd;
    // should never get here
    } else{
      ASSERT(FALSE);
    }
    return EReturn();
  };
    
  // Soldier attack
  SoldierAttack(EVoid) {
    StandingAnimFight();
    autowait(0.2f + FRnd()*0.25f);

    StartModelAnim(ZORGPRO_ANIM_FIRE, 0);
    ShootProjectile(PRT_GRUNT_PROJECTILE_SOL, FIREPOS_SOLDIER, ANGLE3D(0, 0, 0));
    PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);

    autowait(0.15f + FRnd()*0.1f);

    StartModelAnim(ZORGPRO_ANIM_FIRE, 0);
    ShootProjectile(PRT_GRUNT_PROJECTILE_SOL, FIREPOS_SOLDIER, ANGLE3D(0, 0, 0));
    PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);
    

    autowait(FRnd()*0.333f);
    return EEnd();
  };

  // Commander attack (predicted firing on moving player)
  CommanderAttack(EVoid) {
    StandingAnimFight();
    autowait(0.2f + FRnd()*0.25f);

    /*FLOAT3D vGunPosAbs   = GetPlacement().pl_PositionVector + FLOAT3D(0.0f, 1.0f, 0.0f)*GetRotationMatrix();
    FLOAT3D vEnemySpeed  = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    FLOAT3D vEnemyPos    = ((CMovableEntity&) *m_penEnemy).GetPlacement().pl_PositionVector;
    FLOAT   fLaserSpeed  = 45.0f; // m/s
    FLOAT3D vPredictedEnemyPosition = CalculatePredictedPosition(vGunPosAbs,
      vEnemyPos, fLaserSpeed, vEnemySpeed, GetPlacement().pl_PositionVector(2) );
    ShootPredictedProjectile(PRT_GRUNT_LASER, vPredictedEnemyPosition, FLOAT3D(0.0f, 1.0f, 0.0f), ANGLE3D(0, 0, 0));*/

    StartModelAnim(ZORGPRO_ANIM_FIRE, 0);
    ShootProjectile(PRT_GRUNT_PROJECTILE_COM, FIREPOS_COMMANDER_DN, ANGLE3D(-20, 0, 0));
    PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);

    autowait(0.035f);
    StartModelAnim(ZORGPRO_ANIM_FIRE, 0);
    ShootProjectile(PRT_GRUNT_PROJECTILE_COM, FIREPOS_COMMANDER_DN, ANGLE3D(-10, 0, 0));
    PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);

    autowait(0.035f);
    StartModelAnim(ZORGPRO_ANIM_FIRE, 0);
    ShootProjectile(PRT_GRUNT_PROJECTILE_COM, FIREPOS_COMMANDER_DN, ANGLE3D(0, 0, 0));
    PlaySound(m_soFire1, SOUND_FIRE, SOF_3D);

    autowait(0.035f);
    StartModelAnim(ZORGPRO_ANIM_FIRE, 0);
    ShootProjectile(PRT_GRUNT_PROJECTILE_COM, FIREPOS_COMMANDER_DN, ANGLE3D(10, 0, 0));
    PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);

    autowait(0.035f);
    StartModelAnim(ZORGPRO_ANIM_FIRE, 0);
    ShootProjectile(PRT_GRUNT_PROJECTILE_COM, FIREPOS_COMMANDER_DN, ANGLE3D(20, 0, 0));
    PlaySound(m_soFire2, SOUND_FIRE, SOF_3D);

    autowait(FRnd()*0.5f);
    return EReturn();
  };

  // Commander bomb
  CommanderBomb(EVoid) {
    StandingAnimFight();
    autowait(0.2f + FRnd()*0.25f);
	
    StartModelAnim(ZORGPRO_ANIM_THROW, 0);
    PlaySound(m_soSound, SOUND_THROW, SOF_3D);

    autowait(0.8f);

      FLOAT3D vShooting = GetPlacement().pl_PositionVector;
      FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
      FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      
      FLOAT fPitch = 20.0f;
      
      // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, FIREPOS_BOMB(2)-peiTarget->vTargetCenter[1]-1.5f/3.0f, vTarget, 
        vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

      // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
      // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, FIREPOS_BOMB, ANGLE3D( fRelativeHdg, fPitch, 0));
      CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
      ELaunchProjectile eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.prtType = PRT_GRUNTBOMB;
      eLaunch.fSpeed = fLaunchSpeed;
      penProjectile->Initialize(eLaunch);

    autowait(FRnd()*0.5f);
    return EReturn();
  };
    
  // Sniper attack
  SniperAttack(EVoid) {
    StandingAnimFight();

    // start fireing electricity
      const FLOATmatrix3D &m = GetRotationMatrix();
      m_vBeamSource=GetPlacement().pl_PositionVector+FIREPOS_SNIPER*m;

      // target enemy body
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, m_vBeamTarget);

      // fire electricity beam
      m_bRenderElectricity = TRUE;
      m_tmTemp = _pTimer->CurrentTick();
      while(_pTimer->CurrentTick() < m_tmTemp+1.0f)
      {
        wait(_pTimer->TickQuantum) {
          on (EBegin): {
            // correct electricity beam target
            FLOAT3D vNewTarget;
            EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
            GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vNewTarget);
            FLOAT3D vDiff = vNewTarget-m_vBeamTarget;
            // if we have valid length
            if( vDiff.Length() > 1.0f)
            {
              // calculate adjustment
              m_vBeamTarget = m_vBeamTarget+vDiff.Normalize()*10.0f*_pTimer->TickQuantum;
            }

            // cast ray
            CCastRay crRay( this, m_vBeamSource, m_vBeamTarget);
            crRay.cr_bHitTranslucentPortals = FALSE;
            crRay.cr_bPhysical = FALSE;
            crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;
            GetWorld()->CastRay(crRay);

            resume;
          };
          on (ETimer): { stop; };
        }
	}
      m_bRenderElectricity = FALSE;

    // calculate predicted position
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT3D vSpeedDst = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    m_vDesiredPosition = CalculatePredictedPosition(GetPlacement().pl_PositionVector, vTarget, 120,
	 vSpeedDst, GetPlacement().pl_PositionVector(0) );
    // shoot predicted propelled projectile
    StartModelAnim(ZORGPRO_ANIM_FIRE, 0);
    ShootPredictedProjectile(PRT_GRUNT_PROJECTILE_SNIPER, m_vDesiredPosition, FIREPOS_SNIPER, ANGLE3D(0, 0, 0));
    PlaySound(m_soFire1, SOUND_SNIPERFIRE, SOF_3D);
    

    autowait(FRnd()*0.333f);
    MaybeSwitchToAnotherPlayer();
    return EEnd();
  };
    
  // Heavy attack
  HeavyAttack(EVoid) {
    StandingAnimFight();
    autowait(0.2f + FRnd()*0.25f);

      if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
        m_iLoopCounter = 8;
      } else {
        m_iLoopCounter = 16;
      }

      while(m_iLoopCounter>0) {
        INDEX iChannel = m_iLoopCounter%4;
        if (iChannel==0) {
          PlaySound(m_soFire1, SOUND_HEAVYFIRE, SOF_3D);
          StartModelAnim(ZORGPRO_ANIM_FIRE_HEAVY, AOF_LOOPING);
          CModelObject *pmoGun = &GetModelObject()->GetAttachmentModel(ZORGPRO_ATTACHMENT_BARREL3)->
              amo_moModelObject;
            pmoGun->PlayAnim(GUNBARREL_ANIM_FIRE, 0);
          ShootProjectile(PRT_CYBORG_LASER, FIREPOS_HEAVY1, ANGLE3D(0, 0, 0));
        } else if (iChannel==1) {
          PlaySound(m_soFire2, SOUND_HEAVYFIRE, SOF_3D);
          StartModelAnim(ZORGPRO_ANIM_FIRE_HEAVY, AOF_LOOPING);
          CModelObject *pmoGun = &GetModelObject()->GetAttachmentModel(ZORGPRO_ATTACHMENT_BARREL2)->
              amo_moModelObject;
            pmoGun->PlayAnim(GUNBARREL_ANIM_FIRE, 0);
          ShootProjectile(PRT_CYBORG_LASER, FIREPOS_HEAVY2, ANGLE3D(0, 0, 0));
        } else if (iChannel==2) {
          PlaySound(m_soFire3, SOUND_HEAVYFIRE, SOF_3D);
          StartModelAnim(ZORGPRO_ANIM_FIRE_HEAVY, AOF_LOOPING);
          CModelObject *pmoGun = &GetModelObject()->GetAttachmentModel(ZORGPRO_ATTACHMENT_BARREL4)->
              amo_moModelObject;
            pmoGun->PlayAnim(GUNBARREL_ANIM_FIRE, 0);
          ShootProjectile(PRT_CYBORG_LASER, FIREPOS_HEAVY3, ANGLE3D(0, 0, 0));
        } else if (iChannel==3) {
          PlaySound(m_soFire4, SOUND_HEAVYFIRE, SOF_3D);
          StartModelAnim(ZORGPRO_ANIM_FIRE_HEAVY, AOF_LOOPING);
          CModelObject *pmoGun = &GetModelObject()->GetAttachmentModel(ZORGPRO_ATTACHMENT_BARREL1)->
              amo_moModelObject;
            pmoGun->PlayAnim(GUNBARREL_ANIM_FIRE, 0);
          ShootProjectile(PRT_CYBORG_LASER, FIREPOS_HEAVY4, ANGLE3D(0, 0, 0));
        }
        if (m_iLoopCounter>1) {
          if (GetSP()->sp_gdGameDifficulty<=CSessionProperties::GD_EASY) {
            m_fLockOnEnemyTime = 0.4f;
          } else {
            m_fLockOnEnemyTime = 0.1f;
          }
          autocall CEnemyBase::LockOnEnemy() EReturn;
        }
        m_iLoopCounter--;
      }
    

    autowait(FRnd()*0.333f);
    MaybeSwitchToAnotherPlayer();
    return EEnd();
  };


  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
      if (m_gtType == GT_HEAVY) {
        StartModelAnim(ZORGPRO_ANIM_MELEE_HEAVY, 0);
	  } else {
        StartModelAnim(ZORGPRO_ANIM_MELEE, 0);
	  }
    CModelObject *pmoBlade = &GetModelObject()->GetAttachmentModel(ZORGPRO_ATTACHMENT_BLADE)->
      amo_moModelObject;
    pmoBlade->PlayAnim(BLADE_ANIM_PHASE1, 0);
    PlaySound(m_soSound, SOUND_SHEATH, SOF_3D);
    autowait(0.4f);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_gtType == GT_SOLDIER) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 10.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_gtType == GT_COMMANDER) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 15.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_gtType == GT_SNIPER) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_gtType == GT_HEAVY) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 25.0f, FLOAT3D(0, 0, 0), vDirection);
      }
      PlaySound(m_soSound, SOUND_HIT, SOF_3D);
    }
    CModelObject *pmoBlade = &GetModelObject()->GetAttachmentModel(ZORGPRO_ATTACHMENT_BLADE)->
      amo_moModelObject;
    pmoBlade->PlayAnim(BLADE_ANIM_PHASE2, 0);
    autowait(0.45f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_tmMaxHoldBreath = 5.0f;
    en_fDensity = 2000.0f;

    // set your appearance
    SetModel(MODEL_GRUNT);
    switch (m_gtType) {
      case GT_SOLDIER:
        // set your texture
        SetModelMainTexture(TEXTURE_SOLDIER);
        SetModelSpecularTexture(TEXTURE_SPECULAR);
        AddAttachment(ZORGPRO_ATTACHMENT_GUN_SOLDIER, MODEL_GUN_SOLDIER, TEXTURE_GUN_SOLDIER);
        AddAttachment(ZORGPRO_ATTACHMENT_BLADE, MODEL_BLADE, TEXTURE_BLADE);
        // setup moving speed
        m_fWalkSpeed = FRnd() + 2.5f;
        m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
        m_fAttackRunSpeed = FRnd() + 6.5f;
        m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        m_fCloseRunSpeed = FRnd() + 6.5f;
        m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        // setup attack distances
        m_fAttackDistance = 80.0f;
        m_fCloseDistance = 3.0f;
        m_fStopDistance = 3.0f;
        m_fAttackFireTime = 2.0f;
        m_fCloseFireTime = 1.0f;
        m_fIgnoreRange = 200.0f;
        //m_fBlowUpAmount = 65.0f;
        m_fBlowUpAmount = 80.0f;
        m_fBodyParts = 2;
	    m_fBlowUpSize = 2.0f;
		m_fgibTexture = TEXTURE_SOLDIER;
        m_fDamageWounded = 0.0f;
        m_iScore = 600;
        SetHealth(40.0f);
        m_fMaxHealth = 40.0f;
        // set stretch factors for height and width
        GetModelObject()->StretchModel(FLOAT3D(STRETCH_SOLDIER, STRETCH_SOLDIER, STRETCH_SOLDIER));
        break;
  
      case GT_COMMANDER:
        // set your texture
        SetModelMainTexture(TEXTURE_COMMANDER);
        SetModelSpecularTexture(TEXTURE_SPECULAR);
        AddAttachment(ZORGPRO_ATTACHMENT_GUN_COMMANDER, MODEL_GUN_COMMANDER, TEXTURE_GUN_COMMANDER);
        AddAttachment(ZORGPRO_ATTACHMENT_BLADE, MODEL_BLADE, TEXTURE_BLADE);
        // setup moving speed
        m_fWalkSpeed = FRnd() + 3.0f;
        m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
        m_fAttackRunSpeed = FRnd() + 8.0f;
        m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        m_fCloseRunSpeed = FRnd() + 8.0f;
        m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        // setup attack distances
        m_fAttackDistance = 90.0f;
        m_fCloseDistance = 3.5f;
        m_fStopDistance = 3.0f;
        m_fAttackFireTime = 4.0f;
        m_fCloseFireTime = 2.0f;
        m_fBlowUpAmount = 120.0f;
        m_fIgnoreRange = 200.0f;
        // damage/explode properties
        m_fBodyParts = 3;
	    m_fBlowUpSize = 2.4f;
		m_fgibTexture = TEXTURE_COMMANDER;
        m_fDamageWounded = 0.0f;
        m_iScore = 1000;
        SetHealth(60.0f);
        m_fMaxHealth = 60.0f;
        // set stretch factors for height and width
        GetModelObject()->StretchModel(FLOAT3D(STRETCH_COMMANDER, STRETCH_COMMANDER, STRETCH_COMMANDER));
        break;
  
      case GT_SNIPER:
        // set your texture
        SetModelMainTexture(TEXTURE_SNIPER);
        SetModelSpecularTexture(TEXTURE_SPECULAR);
        AddAttachment(ZORGPRO_ATTACHMENT_GUN_SNIPER, MODEL_GUN_SNIPER, TEXTURE_GUN_SNIPER);
        AddAttachment(ZORGPRO_ATTACHMENT_BLADE, MODEL_BLADE, TEXTURE_BLADE);
        // setup moving speed
        m_fWalkSpeed = FRnd() + 3.5f;
        m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
        m_fAttackRunSpeed = FRnd() + 9.5f;
        m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        m_fCloseRunSpeed = FRnd() + 9.5f;
        m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        // setup attack distances
        m_fAttackDistance = 500.0f;
        m_fCloseDistance = 4.0f;
        m_fStopDistance = 4.0f;
        m_fAttackFireTime = 4.0f;
        m_fCloseFireTime = 2.0f;
        m_fBlowUpAmount = 160.0f;
        m_fIgnoreRange = 200.0f;
        // damage/explode properties
        m_fBodyParts = 4;
	    m_fBlowUpSize = 2.8f;
		m_fgibTexture = TEXTURE_SNIPER;
        m_fDamageWounded = 0.0f;
        m_iScore = 1500;
        SetHealth(80.0f);
        m_fMaxHealth = 80.0f;
        // set stretch factors for height and width
        GetModelObject()->StretchModel(FLOAT3D(STRETCH_SNIPER, STRETCH_SNIPER, STRETCH_SNIPER));
        break;;
  
      case GT_HEAVY:
        // set your texture
        SetModelMainTexture(TEXTURE_HEAVY);
        SetModelSpecularTexture(TEXTURE_SPECULAR);
        AddAttachment(ZORGPRO_ATTACHMENT_BLADE, MODEL_BLADE, TEXTURE_BLADE);
        AddAttachment(ZORGPRO_ATTACHMENT_GUNBODY , MODEL_GUN_HEAVY_BODY, TEXTURE_GUN_HEAVY);
        AddAttachment(ZORGPRO_ATTACHMENT_BARREL1 , MODEL_GUN_HEAVY_BARREL, TEXTURE_GUN_HEAVY_BARREL);
        AddAttachment(ZORGPRO_ATTACHMENT_BARREL2 , MODEL_GUN_HEAVY_BARREL, TEXTURE_GUN_HEAVY_BARREL);
        AddAttachment(ZORGPRO_ATTACHMENT_BARREL3 , MODEL_GUN_HEAVY_BARREL, TEXTURE_GUN_HEAVY_BARREL);
        AddAttachment(ZORGPRO_ATTACHMENT_BARREL4 , MODEL_GUN_HEAVY_BARREL, TEXTURE_GUN_HEAVY_BARREL);
        // setup moving speed
        m_fWalkSpeed = FRnd() + 4.0f;
        m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
        m_fAttackRunSpeed = FRnd() + 5.0f;
        m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        m_fCloseRunSpeed = FRnd() + 5.0f;
        m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
        // setup attack distances
        m_fAttackDistance = 300.0f;
        m_fCloseDistance = 4.5f;
        m_fStopDistance = 4.0f;
        m_fAttackFireTime = 4.0f;
        m_fCloseFireTime = 2.0f;
        m_fBlowUpAmount = 200.0f;
        m_fIgnoreRange = 200.0f;
        // damage/explode properties
        m_fBodyParts = 4;
	    m_fBlowUpSize = 3.0f;
		m_fgibTexture = TEXTURE_HEAVY;
        m_fDamageWounded = 20.0f;
        m_iScore = 2000;
        SetHealth(100.0f);
        m_fMaxHealth = 100.0f;
        // set stretch factors for height and width
        GetModelObject()->StretchModel(FLOAT3D(STRETCH_HEAVY, STRETCH_HEAVY, STRETCH_HEAVY));
        break;
    }

    ModelChangeNotify();
    StandingAnim();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
