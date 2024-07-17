305
%{
#include "StdH.h"
#include "ModelsF/t3dgm/Ghoul/Ghoul.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiGhoul = {
 EIBT_BONES, 250.0f,
 0.0f, 1.9f, 0.0f,    // source (eyes)
 0.0f, 1.9f, 0.0f,    // target (body)
};

#define BONES_HIT 2.8f
#define MOUTH_ANGLE1 (15.0f)
#define FIRE_MOUTH     FLOAT3D( 0.0f, 1.5f, -2.0f)
%}


class CGhoul : CEnemyBase {
name      "Ghoul";
thumbnail "Thumbnails\\Ghoul.tbn";

properties:
  2 BOOL m_bFistHit = FALSE,          // used for close attack
  3 BOOL m_bTouchAnother = FALSE,     // another entity touched on far attack
  4 CSoundObject m_soFeet,            // for running sound
  5 BOOL m_bRunSoundPlaying = FALSE,

components:
  0 class   CLASS_BASE        "Classes\\EnemyBase.ecl",
  1 model   MODEL_GHOUL     "ModelsF\\t3dgm\\Ghoul\\Ghoul.mdl",
  2 texture TEXTURE_GHOUL   "ModelsF\\t3dgm\\Ghoul\\ALIEN2.tex",
  3 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  7 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** GHOUL PARTS **************
 10 model     MODEL_ARM    "ModelsF\\t3dgm\\Ghoul\\Debris\\Arm.mdl",
 12 model     MODEL_HEAD   "ModelsF\\t3dgm\\Ghoul\\Debris\\Head.mdl",
 15 model     MODEL_LEG    "ModelsF\\t3dgm\\Ghoul\\Debris\\Leg.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_YELLOW  "ModelsF\\Effects\\Debris\\Flesh\\FleshYellow.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE          "ModelsF\\t3dgm\\Ghoul\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT         "ModelsF\\t3dgm\\Ghoul\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND         "ModelsF\\t3dgm\\Ghoul\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE          "ModelsF\\t3dgm\\Ghoul\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK          "ModelsF\\t3dgm\\Ghoul\\Sounds\\Leap.wav",
 55 sound   SOUND_PUNCH         "ModelsF\\t3dgm\\Ghoul\\Sounds\\Melee.wav",
 56 sound   SOUND_DEATH_RUN     "ModelsF\\t3dgm\\Ghoul\\Sounds\\DeathRun.wav",
 57 sound   SOUND_RUN           "ModelsF\\t3dgm\\Ghoul\\Sounds\\Run.wav",
 58 sound   SOUND_DEATH_STAND   "ModelsF\\t3dgm\\Ghoul\\Sounds\\DeathStand.wav",

functions:
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_KICK );
    PrecacheSound(SOUND_PUNCH);
    PrecacheSound(SOUND_DEATH_RUN);
    PrecacheSound(SOUND_RUN  );
    PrecacheSound(SOUND_DEATH_STAND);

    PrecacheModel(MODEL_ARM);
    PrecacheModel(MODEL_HEAD);
    PrecacheModel(MODEL_LEG);
    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_YELLOW);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_GASCLOUD);

    PrecacheClass(CLASS_PROJECTILE, PRT_GHOUL);
  };

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    if (eDeath.eLastDamage.dmtType==DMT_CLOSERANGE) {
      str.PrintF(TRANS("A gastric ghoul performed forced surgery on %s"), strPlayerName);
    } else {
      str.PrintF(TRANS("%s was puked all over by a gastric ghoul"), strPlayerName);
    }
    return str;
  }

  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\Ghoul.txt");
    return fnm;
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiGhoul;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // ghoul can't harm ghoul
    if (!IsOfClass(penInflictor, "Ghoul")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
      // if died of chainsaw
      if (dmtType==DMT_CHAINSAW && GetHealth()<=0) {
        // must always blowup
        m_fBlowUpAmount = 0;
      }
    }
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if (en_vCurrentTranslationAbsolute.Length()>5.0f) {
      iAnim = GHOUL_ANIM_DEATHRUN;
    } else {
      iAnim = GHOUL_ANIM_DEATHSTAND;
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==GHOUL_ANIM_DEATHRUN)
    {
      vStretch=FLOAT3D(1,1,2)*1.0f;
      return 0.48f;
    }
    else if(GetModelObject()->GetAnim()==GHOUL_ANIM_DEATHSTAND)
    {
      vStretch=FLOAT3D(1,1,2)*0.75f;
      return 0.48f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(GHOUL_COLLISION_BOX_PART_NAME);
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(GHOUL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void StandingAnimFight(void)
  {
    StartModelAnim(GHOUL_ANIM_IDLEFIGHT, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  }
  void WalkingAnim(void) {
    StartModelAnim(GHOUL_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };
  void RunningAnim(void) {
    StartModelAnim(GHOUL_ANIM_RUN, AOF_LOOPING|AOF_NORESTART);
    ActivateRunningSound();
  };
  void RotatingAnim(void) {
    StartModelAnim(GHOUL_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void TauntSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void WoundSound(void) {
    PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
  };
  void DeathSound(void) {
    INDEX iSound;
    if (en_vCurrentTranslationAbsolute.Length()>5.0f) {
      iSound = SOUND_DEATH_RUN;
    } else {
      iSound = SOUND_DEATH_STAND;
    }
    PlaySound(m_soSound, iSound, SOF_3D);
  };


  // running sounds
  void ActivateRunningSound(void)
  {
    if (!m_bRunSoundPlaying) {
      PlaySound(m_soFeet, SOUND_RUN, SOF_3D|SOF_LOOP);
      m_bRunSoundPlaying = TRUE;
    }
  }
  void DeactivateRunningSound(void)
  {
    m_soFeet.Stop();
    m_bRunSoundPlaying = FALSE;
  }

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

    vNormalizedDamage *= 1.0f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

      ULONG ulFleshTexture = TEXTURE_FLESH_YELLOW;
      ULONG ulFleshModel   = MODEL_FLESH;

    // spawn debris
    Debris_Begin(EIBT_FLESH, DPT_GOOTRAIL, BET_GOOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 5.0f, 2.0f);
    
    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_GHOUL, 0, 0, 0, 0, 1.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_ARM, TEXTURE_GHOUL, 0, 0, 0, 0, 1.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_HEAD, TEXTURE_GHOUL, 0, 0, 0, 0, 1.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_GHOUL, 0, 0, 0, 0, 1.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_GHOUL, 0, 0, 0, 0, 1.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	  
      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.5f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }

      // spawn splash fx (sound)
      CPlacement3D plSound = GetPlacement();
      CEntityPointer penSound = CreateEntity(plSound, CLASS_BASIC_EFFECT);
      ESpawnEffect eseSound;
      eseSound.colMuliplier = C_WHITE|CT_OPAQUE;
      eseSound.betType = BET_FLESH_SPLAT_FX;
      penSound->Initialize(eseSound);

      // spawn splash fx
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect eseSplat;
      eseSplat.colMuliplier = C_WHITE|CT_OPAQUE;
      eseSplat.betType = BET_GASCLOUD;
      eseSplat.vStretch = FLOAT3D(1.5f,1.5f,1.5f);
      penSplat->Initialize(eseSplat);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_GREEN|CT_OPAQUE;
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      eSpawnEffect.vStretch = FLOAT3D(1.0f,1.0f,1.0f);
      penExplosion->Initialize(eSpawnEffect);

      // inflict damage
      FLOAT3D vSource;
      GetEntityInfoPosition(this, eiGhoul.vTargetCenter, vSource);
        InflictDirectDamage(this, this, DMT_EXPLOSION, 1000.0f, vSource, -en_vGravityDir);
        InflictRangeDamage(this, DMT_ACID, 30.0f, vSource, 6.0f, 8.0f);

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
    // fire projectile
    StartModelAnim(GHOUL_ANIM_FIRE, 0);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    DeactivateRunningSound();
    autowait(0.45f);

    // bomb 1
    // calculate launch velocity and heading correction for angular launch
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    CalculateAngularLaunchParams(
      GetPlacement().pl_PositionVector, FIRE_MOUTH(2)-1.5f,
      m_penEnemy->GetPlacement().pl_PositionVector, FLOAT3D(0,0,0),
      MOUTH_ANGLE1,
      fLaunchSpeed,
      fRelativeHdg);
    
    // target enemy body
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    FLOAT3D vShootTarget;
    GetEntityInfoPosition(m_penEnemy, peiTarget->vTargetCenter, vShootTarget);
    // launch
    CPlacement3D pl;
    PrepareFreeFlyingProjectile(pl, vShootTarget, FIRE_MOUTH, ANGLE3D(0, MOUTH_ANGLE1, 0));
    CEntityPointer penProjectile = CreateEntity(pl, CLASS_PROJECTILE);
    ELaunchProjectile eLaunch;
    eLaunch.penLauncher = this;
    eLaunch.prtType = PRT_GHOUL;
    eLaunch.fSpeed = fLaunchSpeed;
    penProjectile->Initialize(eLaunch);

    autowait(FRnd()/3+0.5f);

    return EReturn();
  };

  Hit(EVoid) : CEnemyBase::Hit {
    // hit
    if (CalcDist(m_penEnemy) < BONES_HIT) {
      jump HitWithBones();

    // jump
    } else if (CalcDist(m_penEnemy) < 10.0f) {
      jump JumpOnEnemy();
    }

    // run to enemy
    m_fShootTime = _pTimer->CurrentTick() + 0.5f;
    return EReturn();
  };

  // jump on enemy
  JumpOnEnemy(EVoid) {
    StartModelAnim(GHOUL_ANIM_LEAP, 0);
    DeactivateRunningSound();

    // jump
    FLOAT3D vDir = (m_penEnemy->GetPlacement().pl_PositionVector -
                    GetPlacement().pl_PositionVector).Normalize();
    vDir *= !GetRotationMatrix();
    vDir *= m_fCloseRunSpeed*1.5f;
    vDir(2) = 2.5f;
    SetDesiredTranslation(vDir);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);

    // animation - IGNORE DAMAGE WOUND -
    SpawnReminder(this, 0.5f, 0);
    m_iChargeHitAnimation = GHOUL_ANIM_LEAP;
    m_fChargeHitDamage = 15.0f;
    m_fChargeHitAngle = 0.0f;
    m_fChargeHitSpeed = 15.0f;
    autocall CEnemyBase::ChargeHitEnemy() EReturn;
    autowait(0.05f);
    return EReturn();
  };

  // hit with bones
  HitWithBones(EVoid) {
    // attack with bones
    StartModelAnim(GHOUL_ANIM_MELEE, 0);
    DeactivateRunningSound();
    PlaySound(m_soSound, SOUND_PUNCH, SOF_3D);

    // right hand
    m_bFistHit = FALSE;
    autowait(0.35f);
    if (CalcDist(m_penEnemy)<BONES_HIT) { m_bFistHit = TRUE; }
    if (m_bFistHit) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      // damage enemy
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 7.5f, FLOAT3D(0, 0, 0), vDirection);
      // push target left
      FLOAT3D vSpeed;
      GetHeadingDirection(AngleDeg(90.0f), vSpeed);
      vSpeed = vSpeed * 5.0f;
      KickEntity(m_penEnemy, vSpeed);
    }

    // left hand
    m_bFistHit = FALSE;
    autowait(0.3f);
    if (CalcDist(m_penEnemy)<BONES_HIT) { m_bFistHit = TRUE; }
    if (m_bFistHit) {
      // damage enemy
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 7.5f, FLOAT3D(0, 0, 0), vDirection);
      // push target left
      FLOAT3D vSpeed;
      GetHeadingDirection(AngleDeg(-90.0f), vSpeed);
      vSpeed = vSpeed * 5.0f;
      KickEntity(m_penEnemy, vSpeed);
    }
    return EReturn();
  };



/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    // death
    DeactivateRunningSound();
    autocall CEnemyBase::Death() EEnd;
    BlowUp();
    return EEnd();
  };



/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    SetHealth(100.0f);
    m_fMaxHealth = 100.0f;
    en_fDensity = 2000.0f;

    // set your appearance
    SetModel(MODEL_GHOUL);
    SetModelMainTexture(TEXTURE_GHOUL);
    GetModelObject()->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    StandingAnim();
    m_sptType = SPT_GOO;
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.5f;
    m_aWalkRotateSpeed = FRnd()*25.0f + 600.0f;
    m_fAttackRunSpeed = FRnd()*3.0f + 13.0f;
    m_aAttackRotateSpeed = FRnd()*200 + 600.0f;
    m_fCloseRunSpeed = FRnd() + 16.0f;
    m_aCloseRotateSpeed = FRnd()*100 + 1000.0f;
    // setup attack distances
    m_fAttackDistance = 150.0f;
    m_fCloseDistance = 20.0f;
    m_fStopDistance = 2.0f;
    m_fAttackFireTime = 3.0f;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = 200.0f;
    // damage/explode properties
    m_fBlowUpAmount = 200.0f;
    m_fBlowUpSize = 1.0f;
    m_fBodyParts = 7;
    m_fDamageWounded = 800.0f;
    m_iScore = 2000;
    if (m_fStepHeight==-1) {
      m_fStepHeight = 4.0f;
    }

    // set stretch factors for height and width
    CEnemyBase::SizeModel();
    m_soFeet.Set3DParameters(50.0f, 3.0f, 1.0f, 1.0f);
    m_bRunSoundPlaying = FALSE;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
