336

%{
#include "StdH.h"
#include "ModelsF/Enemies/Huanman/Huanman.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/AirWave";

enum HuanChar {
  0 HUAN_SMALL         "Small",      // normal (fighter)
  1 HUAN_BIG            "Big",        // big
};

%{
static _tmLastStandingAnim =0.0f;  
#define HUAN_STRETCH 1.3f
#define BIG_HUAN_STRETCH 4.0f
#define FIRE    FLOAT3D( 0.0f, 2.0f, -1.25f)

#define HUSOUND(soundname) ((m_HuType==HUAN_SMALL)? (SOUND_SMALL_##soundname) : (SOUND_BIG_##soundname))

// info structure
static EntityInfo eiHuanSmall = {
  EIBT_FLESH, 1500.0f,
  0.0f, 1.0f*HUAN_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*HUAN_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiHuanBig = {
  EIBT_FLESH, 5000.0f,
  0.0f, 1.0f*BIG_HUAN_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*BIG_HUAN_STRETCH, 0.0f,     // target (body)
};
%}

class CHuanman : CEnemyBase {
name      "Huanman";
thumbnail "Thumbnails\\Huan.tbn";

properties:
  1 enum HuanChar m_HuType     "Character" 'C' = HUAN_SMALL,
  2 INDEX m_iCounter = 0,
  5 INDEX   m_fgibTexture = TEXTURE_HUAN_SMALL,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 class   CLASS_AIRWAVE     "Classes\\AirWave.ecl",

 10 model   MODEL_HUAN           "ModelsF\\Enemies\\Huanman\\Huanman.mdl",
 11 texture TEXTURE_HUAN_SMALL  "ModelsF\\Enemies\\Huanman\\Black.tex",
 12 texture TEXTURE_HUAN_BIG     "ModelsF\\Enemies\\Huanman\\Red.tex",
 
 13 model   MODEL_SPEAR                 "ModelsF\\Enemies\\Huanman\\Spear.mdl",
 14 texture TEXTURE_SPEAR_SMALL         "ModelsF\\Enemies\\Huanman\\SpearBlack.tex",
 15 texture TEXTURE_SPEAR_BIG           "ModelsF\\Enemies\\Huanman\\Spear.tex",

// ************** SOUNDS **************
 50 sound   SOUND_SMALL_IDLE      "AREP\\Models\\Huanman2\\Sounds\\Small\\Idle.wav",
 51 sound   SOUND_SMALL_SIGHT     "AREP\\Models\\Huanman2\\Sounds\\Small\\Sight.wav",
 52 sound   SOUND_SMALL_WOUND     "AREP\\Models\\Huanman2\\Sounds\\Small\\Wound.wav",
 54 sound   SOUND_SMALL_KICK      "AREP\\Models\\Huanman2\\Sounds\\Small\\Kick.wav",
 55 sound   SOUND_SMALL_DEATH     "AREP\\Models\\Huanman2\\Sounds\\Small\\Death.wav",

 56 sound   SOUND_BIG_IDLE      "AREP\\Models\\Huanman2\\Sounds\\Big\\Idle.wav",
 57 sound   SOUND_BIG_SIGHT     "AREP\\Models\\Huanman2\\Sounds\\Big\\Sight.wav",
 58 sound   SOUND_BIG_WOUND     "AREP\\Models\\Huanman2\\Sounds\\Big\\Wound.wav",
 60 sound   SOUND_BIG_KICK      "AREP\\Models\\Huanman2\\Sounds\\Big\\Kick.wav",
 61 sound   SOUND_BIG_DEATH     "AREP\\Models\\Huanman2\\Sounds\\Big\\Death.wav",
 
 20 sound   SOUND_FIRE_SMALL     "ModelsF\\Enemies\\Huanman\\Sounds\\FireSmall.wav",
 21 sound   SOUND_FIRE_BIG       "ModelsF\\Enemies\\Huanman\\Sounds\\FireBig.wav",
 22 sound   SOUND_HIT_SMALL     "ModelsF\\Enemies\\Huanman\\Sounds\\HitSmall.wav",
 23 sound   SOUND_HIT_BIG       "ModelsF\\Enemies\\Huanman\\Sounds\\HitBig.wav",

 30 model   MODEL_DEBRIS_HEAD           "ModelsF\\Enemies\\Huanman\\Debris\\Hed.mdl",
 31 model   MODEL_DEBRIS_BODY           "ModelsF\\Enemies\\Huanman\\Debris\\Bod.mdl",
 32 model   MODEL_DEBRIS_TAIL           "ModelsF\\Enemies\\Huanman\\Debris\\Tail.mdl",
 35 model   MODEL_DEBRIS_ARM            "ModelsF\\Enemies\\Huanman\\Debris\\Arm.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("An ophidian gored %s"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmHuan1, "DataMP\\Messages\\Enemies\\AREP\\Huan1.txt");
    static DECLARE_CTFILENAME(fnmHuan2, "DataMP\\Messages\\Enemies\\AREP\\Huan2.txt");
    switch(m_HuType) {
    default: ASSERT(FALSE);
    case HUAN_SMALL: return fnmHuan1;
    case HUAN_BIG: return fnmHuan2;
    }
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheModel(MODEL_HUAN);

    PrecacheModel(MODEL_DEBRIS_HEAD);
    PrecacheModel(MODEL_DEBRIS_BODY);
    PrecacheModel(MODEL_DEBRIS_TAIL);
    PrecacheModel(MODEL_DEBRIS_ARM);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);

    if (m_HuType==HUAN_SMALL)
    {
    PrecacheSound(SOUND_SMALL_IDLE );
    PrecacheSound(SOUND_SMALL_SIGHT);
    PrecacheSound(SOUND_SMALL_WOUND);
    PrecacheSound(SOUND_SMALL_DEATH);
    PrecacheSound(SOUND_SMALL_KICK);
    PrecacheTexture(TEXTURE_HUAN_SMALL);
    PrecacheSound(SOUND_FIRE_SMALL);
    PrecacheSound(SOUND_HIT_SMALL);
    PrecacheClass(CLASS_PROJECTILE, PRT_HUANMAN2_FIRE);
	}

    if (m_HuType==HUAN_BIG)
    {
    PrecacheSound(SOUND_BIG_IDLE );
    PrecacheSound(SOUND_BIG_SIGHT);
    PrecacheSound(SOUND_BIG_WOUND);
    PrecacheSound(SOUND_BIG_DEATH);
    PrecacheSound(SOUND_BIG_KICK);
    PrecacheTexture(TEXTURE_HUAN_BIG);
    PrecacheSound(SOUND_FIRE_BIG);
    PrecacheSound(SOUND_HIT_BIG);
    PrecacheClass(CLASS_AIRWAVE);
	}
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_HuType == HUAN_SMALL) {
      return &eiHuanSmall;
    } else if (m_HuType == HUAN_BIG) {
      return &eiHuanBig;
    }
  };

  void ShakeItBaby(FLOAT tmShaketime, FLOAT fPower)
  {
    CWorldSettingsController *pwsc = GetWSC(this);
    if (pwsc!=NULL) {
      pwsc->m_tmShakeStarted = tmShaketime;
      pwsc->m_vShakePos = GetPlacement().pl_PositionVector;
      pwsc->m_fShakeFalloff = 400.0f;
      pwsc->m_fShakeFade = 3.0f;

      pwsc->m_fShakeIntensityZ = 0.0f;
      pwsc->m_tmShakeFrequencyZ = 5.0f;
      pwsc->m_fShakeIntensityY = 0.1f*fPower;
      pwsc->m_tmShakeFrequencyY = 5.0f;
      pwsc->m_fShakeIntensityB = 2.5f*fPower;
      pwsc->m_tmShakeFrequencyB = 7.2f;

      pwsc->m_bShakeFadeIn = FALSE;
    }
  }

  FLOAT GetCrushHealth(void)
  {
    if (m_HuType == HUAN_BIG) {
      return 100.0f;
    }
    return 0.0f;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // cannonballs inflict MORE damage then the default
    if(m_HuType==HUAN_BIG && dmtType==DMT_CANNONBALL)
    {
      fDamageAmmount *= 2.0f;
    }
    // can't harm own class
    if (!IsOfClass(penInflictor, "Huanman")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    StartModelAnim(HUANMAN_ANIM_WOUND, 0);
    return HUANMAN_ANIM_WOUND;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(HUANMAN_ANIM_DEATH, 0);
    return HUANMAN_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==HUANMAN_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,1)*1.0f;
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(HUANMAN_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    _tmLastStandingAnim = _pTimer->CurrentTick();
    StartModelAnim(HUANMAN_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
    StartModelAnim(HUANMAN_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };

  void RunningAnim(void) {
    StartModelAnim(HUANMAN_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
  };
  void RotatingAnim(void) {
    WalkingAnim();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, HUSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, HUSOUND(SIGHT), SOF_3D);
  };
  void WoundSound(void) {
      PlaySound(m_soSound, HUSOUND(WOUND), SOF_3D);
  };
  void DeathSound(void) {
      PlaySound(m_soSound, HUSOUND(DEATH), SOF_3D);
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    if (m_bQuiet) { 
    m_soSound.Set3DParameters(0.0f, 0.0f, 2.0f, 1.0f);
	} else {
      if(m_HuType==HUAN_SMALL) {
        m_soSound.Set3DParameters(80.0f, 10.0f, 1.25f, 1.0f); }
      if(m_HuType==HUAN_BIG) {
        m_soSound.Set3DParameters(200.0f, 50.0f, 1.25f, 1.0f); }
	}
  };


/************************************************************
 *                      FIRE AIRWAVE                        *
 ************************************************************/
  // fire air wave
  void FireAirWave(void) {
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE, ANGLE3D(0, 0, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_AIRWAVE);
    EAirWave eLaunch;
    eLaunch.penLauncher = this;
    penProjectile->Initialize(eLaunch);

      ShakeItBaby(_pTimer->CurrentTick(), 3.0f);
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

    vNormalizedDamage *= 0.35f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);


      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_DEBRIS_HEAD, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_BODY, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_TAIL, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.3f,
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
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    if (m_HuType == HUAN_SMALL) {
      jump CEnemyBase::Death();
    }
    
    // stop moving
    StopMoving();
    DeathSound();     // death sound
    LeaveStain(TRUE);
    // set physic flags
    SetPhysicsFlags(EPF_MODEL_CORPSE);
    SetCollisionFlags(ECF_CORPSE);
    SetFlags(GetFlags() | ENF_SEETHROUGH);
    // stop making fuss
    RemoveFromFuss();
    // death notify (usually change collision box and change body density)
    DeathNotify();
    // start death anim
    AnimForDeath();
    autowait(0.9f);
    if (m_HuType == HUAN_BIG) {
      ShakeItBaby(_pTimer->CurrentTick(), 2.0f);
    } else {
      ShakeItBaby(_pTimer->CurrentTick(), 3.0f);
    }

    // spawn dust effect
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(1,1,2)*15.0f;
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_DUST_FALL;
    CPlacement3D plSmoke=plFX;
    plSmoke.pl_PositionVector+=FLOAT3D(0,0.35f*ese.vStretch(2),0);
    CEntityPointer penFX = CreateEntity(plSmoke, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);

    autowait(GetModelObject()->GetAnimLength(HUANMAN_ANIM_DEATH)-2.3f);
    return EEnd();
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire {
    if (m_HuType==HUAN_SMALL) {
      // fire projectile
      StartModelAnim(HUANMAN_ANIM_FIRE1, 0);
      PlaySound(m_soSound, SOUND_FIRE_SMALL, SOF_3D);
      autowait(0.4f);
      ShootProjectile(PRT_HUANMAN2_FIRE, FIRE, ANGLE3D(0, 0, 0));
      autowait(0.6f);
      StandingAnim();
      autowait(FRnd()/2 + _pTimer->TickQuantum);
	} else if (m_HuType==HUAN_BIG) { 
      // fire projectile
      StartModelAnim(HUANMAN_ANIM_FIRE2, 0);
      PlaySound(m_soSound, SOUND_FIRE_BIG, SOF_3D);
      autowait(0.6f);
      FireAirWave();
      autowait(0.5f);
	}
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    StartModelAnim(HUANMAN_ANIM_MELEE1, 0);
    autowait(0.45f);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_HuType == HUAN_BIG) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 40.0f, FLOAT3D(0, 0, 0), vDirection);
        PlaySound(m_soSound, SOUND_HIT_BIG, SOF_3D);
      } else if (m_HuType == HUAN_SMALL) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 20.0f, FLOAT3D(0, 0, 0), vDirection);
        PlaySound(m_soSound, SOUND_HIT_SMALL, SOF_3D);
      }
    }
    autowait(0.45f);
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
    en_tmMaxHoldBreath = 10.0f;

    en_fDensity = 1100.0f;
    // set your appearance
    SetModel(MODEL_HUAN);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*5 + 5.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 900.0f);
    m_fCloseRunSpeed = FRnd() + 20.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 500.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_fStopDistance = 5.0f;
    m_fCloseDistance = 5.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    if (m_HuType == HUAN_SMALL)
    {
      m_fAttackRunSpeed = 13.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(100.0f);
      SetModelMainTexture(TEXTURE_HUAN_SMALL);
		m_fgibTexture = TEXTURE_HUAN_SMALL;
      AddAttachment(HUANMAN_ATTACHMENT_SPEAR, MODEL_SPEAR, TEXTURE_SPEAR_SMALL);
      m_fBlowUpAmount = 200.0f;
      m_fBodyParts = 3;
	  m_fBlowUpSize = 2.6f;
      m_fDamageWounded = 50.0f;
      m_iScore = 1500;//500
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(HUAN_STRETCH, HUAN_STRETCH, HUAN_STRETCH));
     ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 5.0f;
    }
    else if (m_HuType == HUAN_BIG)
    {
      m_fAttackRunSpeed = 16.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(1000.0f);//500
      SetModelMainTexture(TEXTURE_HUAN_BIG);
		m_fgibTexture = TEXTURE_HUAN_BIG;
      AddAttachment(HUANMAN_ATTACHMENT_SPEAR, MODEL_SPEAR, TEXTURE_SPEAR_BIG);
      m_fBlowUpAmount = 1500.0f;//500
      m_fBodyParts = 8;
	  m_fBlowUpSize = 8.0f;
      m_fDamageWounded = 200.0f;//500
      m_iScore = 9000; //1000
      m_fStopDistance = 10;
      m_fCloseDistance = 10;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(BIG_HUAN_STRETCH, BIG_HUAN_STRETCH, BIG_HUAN_STRETCH));
      ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 5.0f;
    }
    
    m_fMaxHealth = GetHealth();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
