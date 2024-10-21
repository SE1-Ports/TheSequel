336

%{
#include "StdH.h"
#include "ModelsF/Enemies/Mamut/Mamut.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/CannonBall";
uses "EntitiesMP/SpawnerProjectile";

enum MtEnv {
  0 MT_SUMMER   "Summer",
  1 MT_WINTER   "Winter",
};

enum MtType {
  0 MT_NORMAL   "Normal",
  1 MT_CANNON   "Cannon",
  2 MT_SUMM     "Summoner",
};


%{
#define CLOSE_ATTACK_RANGE   42.0f
#define MAMUT_STRETCH        1.0f
static _tmLastStandingAnim = 0.0f;   
#define FIRING_POSITION_MUZZLE = (FLOAT3D(0.0f, 5.3f, -5.0f)*MAMUT_STRETCH);
FLOAT3D vSummPos = (FLOAT3D(0.0f, 5.3f, -6.0f)*MAMUT_STRETCH);
#define TEMP_PER_GROUP 3  

// info structure
static EntityInfo eiMamut2 = {
  EIBT_FLESH, 1600.0f,
  0.0f, 4.0f, 0.0f,     // source (eyes)
  0.0f, 4.5f, 0.0f,     // target (body)
};
%}

class CMamut : CEnemyBase {
name      "Mamut";
thumbnail "Thumbnails\\Mamut.tbn";

properties:
  1 FLOAT m_fSize = 1.3f,
  5 BOOL m_bRunSoundPlaying = FALSE,
  4 CSoundObject m_soFeet,            // for running sound
  2 INDEX m_iCounter = 0,
  3 CEntityPointer m_penFireFX,
  6 enum MtEnv m_mtChar "Environment" 'E' = MT_SUMMER,
  7 BOOL m_bBeBoss  "Boss" 'B' = FALSE,
  8 enum MtType m_mtType "Type" 'Y' = MT_NORMAL,
  9 FLOAT3D m_vTarget = FLOAT3D(0.0f, 0.0f, 0.0f),
 10 FLOAT3D m_vFiringPos      = FLOAT3D(0.0f, 0.0f, 0.0f),

 11 INDEX m_iGroupCount = 0,
 12 CEntityPointer m_penSpawn1  "Template 1" 'T',
 13 CEntityPointer m_penSpawn2  "Template 2",
 14 CEntityPointer m_penSpawn3  "Template 3",

 15 INDEX   m_fgibTexture = TEXTURE_MAMUT_SUMMER,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  4 class   CLASS_CANNONBALL    "Classes\\CannonBall.ecl",
  5 class   CLASS_SPAWNER_PROJECTILE "Classes\\SpawnerProjectile.ecl",

 10 model   MODEL_MAMUT         "ModelsF\\Enemies\\Mamut\\Mamut.mdl",
 11 texture TEXTURE_MAMUT_SUMMER       "ModelsF\\Enemies\\Mamut\\MamutSummer.tex",
 12 texture TEXTURE_MAMUT_WINTER       "ModelsF\\Enemies\\Mamut\\MamutWinter.tex",

 14 model   MODEL_CANNON           "ModelsF\\Enemies\\Mamut\\Cannon.mdl",
 15 texture TEXTURE_CANNON         "ModelsF\\Enemies\\Mamut\\Cannon.tex",

 17 model   MODEL_GUN           "ModelsF\\Enemies\\Mamut\\Gun.mdl",
 18 texture TEXTURE_GUN         "ModelsF\\Enemies\\Mamut\\Gun.tex",
 
 60 model   MODEL_HEAD			 "ModelsF\\Enemies\\Mamut\\Debris\\Head.mdl",
 61 model   MODEL_TUSK	     	 "ModelsF\\Enemies\\Mamut\\Debris\\TuskBig.mdl",
 63 model   MODEL_LEG1	     	 "ModelsF\\Enemies\\Mamut\\Debris\\Leg1.mdl",
 66 model   MODEL_LEG2	     	 "ModelsF\\Enemies\\Mamut\\Debris\\Leg2.mdl",

 64 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 65 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

 // ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\Enemies\\Mamut\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\Enemies\\Mamut\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\Enemies\\Mamut\\Sounds\\Wound.wav",
 55 sound   SOUND_DEATH     "ModelsF\\Enemies\\Mamut\\Sounds\\Death.wav",
 56 sound   SOUND_MOVING     "AREP\\Models\\Mamut2\\Sounds\\Moving.wav",
 57 sound   SOUND_ATTACK      "ModelsF\\Enemies\\Mamut\\Sounds\\Stomp.wav",
 58 sound   SOUND_CANNON      "ModelsF\\Enemies\\Mamut\\Sounds\\Fire.wav",
 59 sound   SOUND_SUMMON      "ModelsF\\Enemies\\Mamut\\Sounds\\Summon.wav",

functions:

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A mammoth flattened %s"), strPlayerName);
    return str;
  }
  
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmMamutNormal, "DataMP\\Messages\\Enemies\\AREP\\Mamut.txt");
    static DECLARE_CTFILENAME(fnmMamutCannon, "DataMP\\Messages\\Enemies\\AREP\\MamutCannon.txt");
    static DECLARE_CTFILENAME(fnmMamutSummon, "DataMP\\Messages\\Enemies\\AREP\\MamutSummon.txt");
    switch(m_mtType) {
    default: ASSERT(FALSE);
    case MT_SUMM: return fnmMamutSummon;
    case MT_CANNON: return fnmMamutCannon;
    case MT_NORMAL : return fnmMamutNormal;
	}
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
   {
    if (slPropertyOffset >= offsetof(CMamut, m_penSpawn1) && slPropertyOffset <= offsetof(CMamut, m_penSpawn3))
	 {
      return ValidEnemy(penTarget);
    } 
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }

  BOOL ValidEnemy(CEntity *pen) {
    if (pen == NULL || pen == this || !IsDerivedFromClass(pen, "Enemy Base")) {
      return FALSE;
    }
    return ((CEnemyBase&)*pen).m_bTemplate;
  };
  
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_MOVING);
    PrecacheSound(SOUND_ATTACK);
    PrecacheSound(SOUND_CANNON);
    PrecacheSound(SOUND_SUMMON);
    PrecacheModel(MODEL_MAMUT);
    PrecacheModel(MODEL_CANNON);
    PrecacheTexture(TEXTURE_CANNON);
    PrecacheModel(MODEL_GUN);
    PrecacheTexture(TEXTURE_GUN);
    
    PrecacheClass(CLASS_CANNONBALL);

	PrecacheModel(MODEL_HEAD);
	PrecacheModel(MODEL_TUSK);
	PrecacheModel(MODEL_LEG1);
	PrecacheModel(MODEL_LEG2);

    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiMamut2;
  };

  // render particles
  void RenderParticles(void)
  {
    Particles_RunningDust(this);
    CEnemyBase::RenderParticles();
  }

  BOOL ForcesCannonballToExplode(void)
  {
    return TRUE;
  }

  void ShakeItBaby(FLOAT tmShaketime, FLOAT fPower)
  {
    CWorldSettingsController *pwsc = GetWSC(this);
    if (pwsc!=NULL) {
      pwsc->m_tmShakeStarted = tmShaketime;
      pwsc->m_vShakePos = GetPlacement().pl_PositionVector;
      pwsc->m_fShakeFalloff = 150.0f;
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
    return 100.0f;
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // can't harm own class
    if (!IsOfClass(penInflictor, "Mamut")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    StartModelAnim(MAMUT_ANIM_WOUND, 0);
    return MAMUT_ANIM_WOUND;
    DeactivateRunningSound();
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(MAMUT_ANIM_DEATH, 0);
    DeactivateRunningSound();
    return MAMUT_ANIM_DEATH;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch)
  {
    vStretch=FLOAT3D(1,1,1)*0.5f;
    return 0.5f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(MAMUT_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    //_tmLastStandingAnim = _pTimer->CurrentTick();
    StartModelAnim(MAMUT_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };

  void WalkingAnim(void) {
    StartModelAnim(MAMUT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };

  void RunningAnim(void) {
    StartModelAnim(MAMUT_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(MAMUT_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void TauntSound(void) {
    PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };


  void LaunchMonster1(void)
  {
    ASSERT(m_penSpawn1!=NULL);
    // calculate parameters for predicted angular launch curve
    FLOAT3D vFirePos = vSummPos;
    FLOAT3D vShooting = GetPlacement().pl_PositionVector + m_vFiringPos;
      m_vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    FLOAT fPitch = FRnd()*10.0f + 25.0f;

    // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1]-1.5f/3.0f, m_vTarget, 
      vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

    // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    CPlacement3D pl;
    CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1]-1.5f/3.0f, m_vTarget, 
      vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);
    
    PrepareFreeFlyingProjectile(pl, vShootTarget, vFirePos, ANGLE3D( fRelativeHdg, fPitch, 0.0f));
    
    ESpawnerProjectile esp;
    CEntityPointer penSProjectile = CreateEntity(pl, CLASS_SPAWNER_PROJECTILE);
    esp.penOwner = this;
    esp.penTemplate = m_penSpawn1;
    penSProjectile->Initialize(esp);
    
    ((CMovableEntity &)*penSProjectile).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -fLaunchSpeed), (CMovableEntity*)(CEntity*)this);
  }


  void LaunchMonster2(void)
  {
    ASSERT(m_penSpawn2!=NULL);
    // calculate parameters for predicted angular launch curve
    FLOAT3D vFirePos = vSummPos;
    FLOAT3D vShooting = GetPlacement().pl_PositionVector + m_vFiringPos;
      m_vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    FLOAT fPitch = FRnd()*10.0f + 25.0f;

    // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1]-1.5f/3.0f, m_vTarget, 
      vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

    // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    CPlacement3D pl;
    CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1]-1.5f/3.0f, m_vTarget, 
      vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);
    
    PrepareFreeFlyingProjectile(pl, vShootTarget, vFirePos, ANGLE3D( fRelativeHdg, fPitch, 0.0f));
    
    ESpawnerProjectile esp;
    CEntityPointer penSProjectile = CreateEntity(pl, CLASS_SPAWNER_PROJECTILE);
    esp.penOwner = this;
    esp.penTemplate = m_penSpawn2;
    penSProjectile->Initialize(esp);
    
    ((CMovableEntity &)*penSProjectile).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -fLaunchSpeed), (CMovableEntity*)(CEntity*)this);
  }


  void LaunchMonster3(void)
  {
    ASSERT(m_penSpawn3!=NULL);
    // calculate parameters for predicted angular launch curve
    FLOAT3D vFirePos = vSummPos;
    FLOAT3D vShooting = GetPlacement().pl_PositionVector + m_vFiringPos;
      m_vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    FLOAT fPitch = FRnd()*10.0f + 25.0f;

    // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1]-1.5f/3.0f, m_vTarget, 
      vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

    // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);

    CPlacement3D pl;
    CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1]-1.5f/3.0f, m_vTarget, 
      vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);
    
    PrepareFreeFlyingProjectile(pl, vShootTarget, vFirePos, ANGLE3D( fRelativeHdg, fPitch, 0.0f));
    
    ESpawnerProjectile esp;
    CEntityPointer penSProjectile = CreateEntity(pl, CLASS_SPAWNER_PROJECTILE);
    esp.penOwner = this;
    esp.penTemplate = m_penSpawn3;
    penSProjectile->Initialize(esp);
    
    ((CMovableEntity &)*penSProjectile).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -fLaunchSpeed), (CMovableEntity*)(CEntity*)this);
  }

  // running sounds
  void ActivateRunningSound(void)
  {
    if (!m_bRunSoundPlaying) {
      PlaySound(m_soFeet, SOUND_MOVING, SOF_3D|SOF_LOOP);
      m_bRunSoundPlaying = TRUE;
    }
  }
  void DeactivateRunningSound(void)
  {
    m_soFeet.Stop();
    m_bRunSoundPlaying = FALSE;
  }


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    if (m_bQuiet) { 
    m_soFeet.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
    m_soSound.Set3DParameters(0.0f, 0.0f, 1.5f, 1.0f);
	} else { 
    m_soFeet.Set3DParameters(300.0f, 50.0f, 1.0f, 1.0f);
    m_soSound.Set3DParameters(160.0f, 50.0f, 1.5f, 1.0f);
	} 
    m_bRunSoundPlaying = FALSE;
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
	Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 2.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_HEAD, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_TUSK, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_TUSK, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG1, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG1, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG2, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG2, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 1.0f,
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
    autowait(1.0f);
    ShakeItBaby(_pTimer->CurrentTick(), 4.0f);

    // spawn dust effect
    CPlacement3D plFX=GetPlacement();
    ESpawnEffect ese;
    ese.colMuliplier = C_WHITE|CT_OPAQUE;
    ese.vStretch = FLOAT3D(1,1,1)*5.0f;
    ese.vNormal = FLOAT3D(0,1,0);
    ese.betType = BET_DUST_FALL;
    CPlacement3D plSmoke=plFX;
    plSmoke.pl_PositionVector+=FLOAT3D(0,0.35f*ese.vStretch(2),0);
    CEntityPointer penFX = CreateEntity(plSmoke, CLASS_BASIC_EFFECT);
    penFX->Initialize(ese);

    autowait(GetModelObject()->GetAnimLength(MAMUT_ANIM_DEATH)-0.5f);
    return EEnd();
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    if (CalcDist(m_penEnemy) < 42.0f) {
      DeactivateRunningSound();
      StartModelAnim(MAMUT_ANIM_STOMP, 0);
      PlaySound(m_soSound, SOUND_ATTACK, SOF_3D);
	  autowait(0.65f);
	  FLOAT3D vSource;
      vSource = GetPlacement().pl_PositionVector +
      FLOAT3D(m_penEnemy->en_mRotation(1, 2), m_penEnemy->en_mRotation(2, 2), m_penEnemy->en_mRotation(3, 2));
      {
        InflictRangeDamage(this, DMT_IMPACT, 50.0f, vSource, 7.5f, m_fCloseDistance);
        FLOAT3D mDirection;
        GetPitchDirection(AngleDeg(10.0f), mDirection);
        KickEntity(m_penEnemy, 0.0);
      }
	  {
    ShakeItBaby(_pTimer->CurrentTick(), 2.0f);
	      // spawn particle effect
    CPlacement3D pl = GetPlacement();
    pl.pl_PositionVector(2) += 0.1f;
	CEntityPointer penShockwave = CreateEntity(pl, CLASS_BASIC_EFFECT);
    ESpawnEffect eSpawnEffect;
    eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
    eSpawnEffect.betType = BET_CANNONSHOCKWAVE;
    eSpawnEffect.vStretch = FLOAT3D(3.0f, 3.0f, 3.0f);
	penShockwave->Initialize(eSpawnEffect);
	}
	autowait(0.4f);
      MaybeSwitchToAnotherPlayer();
	  StandingAnim();
	autowait(0.6f);
    } else {
      // run to enemy
      m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    }
    return EReturn();
  }

Fire(EVoid) : CEnemyBase::Fire {
    // fire projectile 
    if (m_mtType==MT_CANNON) {
      StartModelAnim(MAMUT_ANIM_FIRE, 0);
      DeactivateRunningSound();
      PlaySound(m_soSound, SOUND_CANNON, SOF_3D);
	  autowait(0.45f);
   
      m_vFiringPos FIRING_POSITION_MUZZLE;
      m_vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
      FLOAT3D vShooting = GetPlacement().pl_PositionVector + m_vFiringPos;
      FLOAT3D vSpeedDest = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
      FLOAT fLaunchSpeed;
      FLOAT fRelativeHdg;
      FLOAT fPitch = 20.0f;

    // calculate parameters for predicted angular launch curve
      EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
      CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1]-1.5f/3.0f, m_vTarget, 
      vSpeedDest, fPitch, fLaunchSpeed, fRelativeHdg);

    // target enemy body
      FLOAT3D vShootTarget;
      GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch
      CPlacement3D pl;
      PrepareFreeFlyingProjectile(pl, vShootTarget, m_vFiringPos, ANGLE3D( fRelativeHdg, fPitch, 0));
      CEntityPointer penBall = CreateEntity(pl, CLASS_CANNONBALL);
      ELaunchCannonBall eLaunch;
      eLaunch.penLauncher = this;
      eLaunch.fLaunchPower = fLaunchSpeed;
      eLaunch.cbtType = CBT_IRON;
      eLaunch.fSize = 1.5f;
      penBall->Initialize(eLaunch);

	  autowait(0.55f);
      MaybeSwitchToAnotherPlayer();
   
	}
    if (m_mtType==MT_SUMM) {
      StartModelAnim(MAMUT_ANIM_SUMMON, 0);
      DeactivateRunningSound();
      PlaySound(m_soSound, SOUND_SUMMON, SOF_3D);
	  autowait(0.45f);

    INDEX iRnd = IRnd()%3;
    switch(iRnd)
    {
    case 0: LaunchMonster1(); break;
    case 1: LaunchMonster2(); break;
    case 2: LaunchMonster3(); break;
	}

	  autowait(0.8f);
      MaybeSwitchToAnotherPlayer();
	}

   if (m_mtType==MT_NORMAL) {}

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
    en_tmMaxHoldBreath = 60.0f;

    en_fDensity = 50000.0f;
    m_bBoss = m_bBeBoss;
    // set your appearance
    SetModel(MODEL_MAMUT);
    m_fSize = 1.3f;
    if (m_mtChar==MT_SUMMER) {
      SetModelMainTexture(TEXTURE_MAMUT_SUMMER);
		m_fgibTexture = TEXTURE_MAMUT_SUMMER;
    } else {
      SetModelMainTexture(TEXTURE_MAMUT_WINTER);
		m_fgibTexture = TEXTURE_MAMUT_WINTER;
    }
    if (m_mtType==MT_CANNON) {
    AddAttachment(MAMUT_ATTACHMENT_CANNON, MODEL_CANNON, TEXTURE_CANNON);
    ModelChangeNotify();
    } else if (m_mtType==MT_SUMM) {
    AddAttachment(MAMUT_ATTACHMENT_GUN, MODEL_GUN, TEXTURE_GUN);
    ModelChangeNotify();
    }
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()/1.0f + 3.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 900.0f);
    m_fCloseRunSpeed = FRnd()/1.0f + 13.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    m_fAttackRunSpeed = FRnd()/1.0f + 11.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100.0f + 900.0f);
    // setup attack distances
    m_fAttackDistance = 200.0f;
    m_fCloseDistance = 25.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 5.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 800.0f;
    m_fStopDistance = 5.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    SetHealth(800.0f);
    m_fMaxHealth = GetHealth();
    m_fBlowUpAmount = 2000.0f;
	m_fBlowUpSize = 2.5f;
    m_fBodyParts = 10;
    m_fDamageWounded = 500.0f;
    if (m_mtType==MT_CANNON) {
          m_iScore = 10000;
	} else if (m_mtType==MT_SUMM)  {
          m_iScore = 14000;
	} else if (m_mtType==MT_NORMAL)  {
          m_iScore = 6000;
		  };
    m_fLockOnEnemyTime = 3.0f;

    // set stretch factor

    Particles_RunningDust_Prepare(this);
    
    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
