323
%{
#include "StdH.h"
#include "ModelsF/t3dgm/Cyclops/Arm.h"
#include "ModelsF/t3dgm/Cyclops/Head.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/BasicEffects";

enum CyProjChar {
  0 CYP_A   "Arm",
  1 CYP_H   "Head",
};

%{
static EntityInfo eiCyclopsProjectile = {
  EIBT_FLESH, 120.0f,
  0.0f, 1.4f, 0.0f,
  0.0f, 1.0f, 0.0f,
};

#define BITE_AIR    3.0f
#define CENTER   FLOAT3D(0.0f, 0.0f, 0.0f)
%}


class CCyclopsProjectile : CEnemyFly {
name      "CyclopsProjectile";
thumbnail "Thumbnails\\CyclopsProjectile.tbn";

properties:
  1 enum CyProjChar m_CypChar "Character" 'C' = CYP_A,      // character
  4 BOOL m_bFlyingSoundPlaying = FALSE,
  5 CSoundObject m_soFly,

  6 BOOL m_bSpawned = FALSE,
  7 INDEX m_bCountAsKill = FALSE,
  8 BOOL m_bExploded = FALSE,
  9 BOOL m_bRenderParticles=FALSE,

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_ARM         "ModelsF\\t3dgm\\Cyclops\\Arm.mdl",
  5 model   MODEL_HEAD        "ModelsF\\t3dgm\\Cyclops\\Head.mdl",
  2 texture TEXTURE_GREEN     "ModelsF\\t3dgm\\Cyclops\\cyclop03.tex",
  3 texture TEXTURE_BLUE      "ModelsF\\t3dgm\\Cyclops\\cyclop01.tex",
  4 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
  6 class   CLASS_PROJECTILE     "Classes\\Projectile.ecl",

// ************** SOUNDS **************
 50 sound   SOUND_ARMATTACK      "ModelsF\\t3dgm\\Cyclops\\Sounds\\ArmAttack.wav",
 51 sound   SOUND_HEADSPLODE     "ModelsF\\t3dgm\\Cyclops\\Sounds\\Headsplode.wav",
 52 sound   SOUND_FLY            "ModelsF\\t3dgm\\Cyclops\\Sounds\\Projectile.wav",

 60 model   MODEL_DEBRIS_ARM1   "ModelsF\\t3dgm\\Cyclops\\Debris\\Arm1.mdl",
 61 model   MODEL_DEBRIS_ARM2   "ModelsF\\t3dgm\\Cyclops\\Debris\\Arm2.mdl",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    if (m_bInAir) {
      str.PrintF(TRANS("%s has been killed to death"), strPlayerName);
    } else {
      str.PrintF(TRANS("%s was beaten up by a Gnaar"), strPlayerName);
    }
    return str;
  }
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_ARMATTACK );
    PrecacheSound(SOUND_HEADSPLODE);
    PrecacheSound(SOUND_FLY);

	PrecacheModel(MODEL_DEBRIS_ARM1);
	PrecacheModel(MODEL_DEBRIS_ARM2);

    PrecacheClass(CLASS_BASIC_EFFECT, BET_GIZMO_SPLASH_FX);
    PrecacheClass(CLASS_PROJECTILE, PRT_CYBORG_LASER);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiCyclopsProjectile;
  };

  // render particles
  void RenderParticles(void)
  {
   if(m_bRenderParticles) {
       Particles_BloodTrail(this);
      CEnemyBase::RenderParticles();
	  }
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // CyclopsProjectile can't harm CyclopsProjectile
    if (!IsOfClass(penInflictor, "CyclopsProjectile")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    CEnemyBase::FillEntityStatistics(pes);
    switch(m_CypChar) {
    case CYP_A: { pes->es_strName+=" Arm"; } break;
    case CYP_H : { pes->es_strName+=" Head"; } break;
	}
    return TRUE;
  }

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if(m_CypChar==CYP_H) {
      iAnim = HEAD_ANIM_ATTACK;
    } else {
      iAnim = ARM_ANIM_IDLE;
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // virtual anim functions
  void StandingAnim(void) {
    if(m_CypChar==CYP_H) {
      StartModelAnim(HEAD_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(ARM_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void WalkingAnim(void) {
    if(m_CypChar==CYP_H) {
      StartModelAnim(HEAD_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(ARM_ANIM_FLY, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RunningAnim(void) {
    if(m_CypChar==CYP_H) {
      StartModelAnim(HEAD_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(ARM_ANIM_FLY, AOF_LOOPING|AOF_NORESTART);
    }
  };
  void RotatingAnim(void) {
    if(m_CypChar==CYP_H) {
      StartModelAnim(HEAD_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    } else {
      StartModelAnim(ARM_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    }
  };

  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_HEADSPLODE, SOF_3D);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    m_soFly.Set3DParameters(50.0f, 3.0f, 0.5f, 1.0f);
  };

  BOOL CountAsKill(void)
  {
    return m_bCountAsKill;
  }

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/

  // spawn body parts
  void BlowUp(void) {
    if (m_CypChar==CYP_A) {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

	
    // spawn debris
	Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 2.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_DEBRIS_ARM1, TEXTURE_GREEN, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM2, TEXTURE_GREEN, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

      // spawn splash fx (sound)
      CPlacement3D plSplat = GetPlacement();
      CEntityPointer penSplat = CreateEntity(plSplat, CLASS_BASIC_EFFECT);
      ESpawnEffect ese;
      ese.colMuliplier = C_WHITE|CT_OPAQUE;
      ese.betType = BET_GIZMO_SPLASH_FX;
      penSplat->Initialize(ese);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
	}
    if (m_CypChar==CYP_H) {
      FLOAT3D vSource;

      // inflict damage
      GetEntityInfoPosition(this, eiCyclopsProjectile.vTargetCenter, vSource); 
      InflictDirectDamage(this, this, DMT_EXPLOSION, 200000.0f, vSource, -en_vGravityDir);
      InflictRangeDamage(this, DMT_EXPLOSION, 20.0f, vSource, 2.0f, 7.0f);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_BLUE|CT_OPAQUE;
      eSpawnEffect.betType = BET_LIGHT_CANNON;
      eSpawnEffect.vStretch = FLOAT3D(1.0f,1.0f,1.0f);
      penExplosion->Initialize(eSpawnEffect);

     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 0, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 30, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 60, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 90, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 120, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 150, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 180, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 210, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 240, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 270, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 300, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(0, 330, 0));

     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 0, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 30, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 60, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 90, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 120, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 150, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 180, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 210, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 240, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 270, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 300, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(45, 330, 0));

     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 0, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 30, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 60, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 90, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 120, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 150, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 180, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 210, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 240, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 270, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 300, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-45, 330, 0));

     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 0, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 30, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 60, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 90, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 120, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 150, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 180, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 210, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 240, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 270, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 300, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(90, 330, 0));

     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 0, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 30, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 60, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 90, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 120, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 150, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 180, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 210, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 240, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 270, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 300, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-90, 330, 0));

     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 0, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 30, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 60, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 90, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 120, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 150, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 180, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 210, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 240, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 270, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 300, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(135, 330, 0));

     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 0, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 30, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 60, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 90, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 120, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 150, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 180, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 210, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 240, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 270, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 300, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(-135, 330, 0));

     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 0, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 30, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 60, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 90, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 120, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 150, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 180, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 210, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 240, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 270, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 300, 0));
     ShootProjectile(PRT_CYBORG_LASER, CENTER, ANGLE3D(180, 330, 0));

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
	 }
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

  // must be more relaxed about hitting then usual enemies
  BOOL CanHitEnemy(CEntity *penTarget, FLOAT fCosAngle) {
    if (IsInPlaneFrustum(penTarget, fCosAngle)) {
      return IsVisibleCheckAll(penTarget);
    }
    return FALSE;
  };
procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  FlyHit(EVoid) : CEnemyFly::FlyHit {
    if (m_CypChar==CYP_A) {
     if (CalcDist(m_penEnemy) > BITE_AIR) {
        m_fShootTime = _pTimer->CurrentTick() + 0.25f;
        return EReturn();
      }
     StartModelAnim(ARM_ANIM_ATTACK, 0);
     StopMoving();
     autowait(0.45f);
     PlaySound(m_soSound, SOUND_ARMATTACK, SOF_3D);
    // damage enemy
     if (CalcDist(m_penEnemy) < BITE_AIR) {
       FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
       vDirection.SafeNormalize();
       InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 5.0f, FLOAT3D(0, 0, 0), vDirection);
       // spawn blood cloud
       ESpawnEffect eSpawnEffect;
       eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
       eSpawnEffect.betType = BET_BLOODEXPLODE;
       eSpawnEffect.vStretch = FLOAT3D(1,1,1);
       CPlacement3D plOne = GetPlacement();
       GetEntityPointRatio(
         FLOAT3D(Lerp(-0.2f, +0.2f, FRnd()), Lerp(-0.2f, +0.2f, FRnd()), -1.0f),
         plOne.pl_PositionVector);
       CEntityPointer penBloodCloud = CreateEntity( plOne, CLASS_BASIC_EFFECT);
       penBloodCloud->Initialize( eSpawnEffect);
      }
     autowait(0.24f);
     StandingAnim();
     return EReturn();
	 }
	if (m_CypChar==CYP_H) {
    StopMoving();
    StartModelAnim(HEAD_ANIM_ATTACK, 0);
    PlaySound(m_soSound, SOUND_HEADSPLODE, SOF_3D);
    autowait(0.5f);
    m_bRenderParticles=FALSE;
     m_soFly.Stop();
    BlowUp();
	}
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop {
    // if spawned by other entity
    if (m_bSpawned) {
      m_bSpawned = FALSE;
      m_bCountAsKill = FALSE;
    }

      PlaySound(m_soFly, SOUND_FLY, SOF_3D|SOF_LOOP);
    return EReturn();
  }


/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    if (m_CypChar==CYP_A) {
      SetHealth(30.0f);
      m_fMaxHealth = 30.0f;
      // damage/explode properties
      m_fBlowUpAmount = 0.0f;
      m_fBodyParts = 2;
      m_fBlowUpSize = 2.0f;
      m_fDamageWounded = 400.0f;
    } else {
      SetHealth(30.0f);
      m_fMaxHealth = 30.0f;
      // damage/explode properties
      m_fBlowUpAmount = 0.0f;
      m_fBodyParts = 0;
      m_fBlowUpSize = 1.0f;
      m_fDamageWounded = 250.0f;
    }
    en_fDensity = 2000.0f;
	m_EeftType=EFT_FLY_ONLY;

    // set your appearance
    if (m_CypChar==CYP_A) {
      SetModel(MODEL_ARM);
      SetModelMainTexture(TEXTURE_GREEN);
      GetModelObject()->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
      ModelChangeNotify();
      m_iScore = 0;
    } else {
      m_iScore = 0;
      SetModel(MODEL_HEAD);
      SetModelMainTexture(TEXTURE_BLUE);
      GetModelObject()->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
      ModelChangeNotify();
    }
	m_bRenderParticles = TRUE;
    // setup moving speed
    m_fWalkSpeed = FRnd() + 1.5f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 500.0f;
    if (m_CypChar==CYP_A) {
      m_fAttackRunSpeed = FRnd()*2.0f + 10.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 10.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
    } else {
      m_fAttackRunSpeed = FRnd()*2.0f + 9.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
      m_fCloseRunSpeed = FRnd()*2.0f + 9.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
    }
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 3.5f;
    m_fStopDistance = 1.5f;
    m_fAttackFireTime = 2.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 200.0f;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd()*2.0f + 3.0f;
    m_aFlyWalkRotateSpeed = FRnd()*20.0f + 600.0f;
    if (m_CypChar==CYP_A) {
      m_fFlyAttackRunSpeed = FRnd()*2.0f + 12.5f;
      m_aFlyAttackRotateSpeed = FRnd()*25 + 350.0f;
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 9.5f;
      m_aFlyCloseRotateSpeed = FRnd()*50 + 400.0f;
    } else {
      m_fFlyAttackRunSpeed = FRnd()*2.0f + 10.5f;
      m_aFlyAttackRotateSpeed = FRnd()*25 + 300.0f;
      m_fFlyCloseRunSpeed = FRnd()*2.0f + 9.5f;
      m_aFlyCloseRotateSpeed = FRnd()*50 + 300.0f;
    }
    m_fGroundToAirSpeed = 2.5f;
    m_fAirToGroundSpeed = 2.5f;
    m_fAirToGroundMin = 0.1f;
    m_fAirToGroundMax = 0.1f;
    m_fFlyHeight = 1.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = 100.0f;
    m_fFlyCloseDistance = 10.0f;
    m_fFlyStopDistance = 1.5f;
    m_fFlyAttackFireTime = 2.0f;
    m_fFlyCloseFireTime = 0.5f;
    m_fFlyIgnoreRange = 200.0f;

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};
