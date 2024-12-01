336

%{
#include "StdH.h"
#include "ModelsF/Enemies/Airman/Airman.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
#include "Models/Enemies/Elementals/Twister.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Twister";

enum AirType {
  0 AIR_SMALL          "Small",      // small (fighter)
  1 AIR_BIG            "Big",        // big
  2 AIR_HUGE           "Large",      // large
};

enum AttType {
  0 ATT_BALLS    "Balls only",
  1 ATT_WIND     "Twisters only",
  2 ATT_BOTH     "Both",
};


enum AirmanState {
  0 AIRS_NORMAL        "Normal",     // normal state
  1 AIRS_CLOUD         "Cloud",      // as plane
  2 AIRS_BOX           "Box",        // in box
};

%{
#define ECF_AIR ( \
  ((ECBI_BRUSH|ECBI_MODEL|ECBI_CORPSE|ECBI_ITEM|ECBI_PROJECTILE_MAGIC|ECBI_PROJECTILE_SOLID)<<ECB_TEST) |\
  ((ECBI_MODEL|ECBI_CORPSE|ECBI_ITEM|ECBI_PROJECTILE_MAGIC|ECBI_PROJECTILE_SOLID)<<ECB_PASS) |\
  ((ECBI_MODEL)<<ECB_IS))
#define EPF_BOX_PLANE_ELEMENTAL (EPF_ORIENTEDBYGRAVITY|EPF_MOVABLE)

static _tmLastStandingAnim =0.0f;  
#define AIR_SMALL_STRETCH 3.0f
#define AIR_BIG_STRETCH 12.0f
#define AIR_LARGE_STRETCH 40.0f

FLOAT3D vTwisterLaunchPosBig (FLOAT3D(0.0f, 22.5f, 0.0f));
FLOAT3D vTwisterLaunchPosHuge (FLOAT3D(0.0f, 62.5f, 0.0f));
#define AIRMAN_SPAWN_BIG   (FLOAT3D(0.0171274f, 1.78397f, -0.291414f)*AIR_BIG_STRETCH)
#define AIRMAN_SPAWN_LARGE (FLOAT3D(0.0171274f, 1.78397f, -0.291414f)*AIR_LARGE_STRETCH)

// info structure

// water
static EntityInfo eiAirmanSmall = {
  EIBT_AIR, 500.0f,
  0.0f, 3.5f, 0.0f,
  0.0f, 3.5f, 0.0f,
};
static EntityInfo eiAirmanBig = {
  EIBT_AIR, 2000.0f,
  0.0f, 12.5f, 0.0f,
  0.0f, 12.5f, 0.0f,
};
static EntityInfo eiAirmanLarge = {
  EIBT_AIR, 8000.0f,
  0.0f, 40.5f, 0.0f,
  0.0f, 40.5f, 0.0f,
};
%}

class CAirman : CEnemyBase {
name      "Airman";
thumbnail "Thumbnails\\AirElemental.tbn";

properties:
  1 enum AirType m_airType     "Character" 'C' = AIR_SMALL,
  2 INDEX m_iCounter = 0,
  3 enum AttType m_attType "Type" 'Y' = ATT_BOTH,
  4 enum AirmanState m_AirStartState   "State" 'S' = AIRS_NORMAL,
  5 enum AirmanState m_AirCurrentState = AIRS_NORMAL,
  7 BOOL m_bAirBoss  "Boss" 'B' = FALSE,
  8 CSoundObject m_soBackground,  // sound channel for background noise
 21 CSoundObject m_soPoof,  // sound channel for death noise

 22 BOOL m_bSpawnWhenHarmed               "Damage spawn" 'N' = TRUE,
  9 BOOL m_bSpawnOnBlowUp                 "Blowup spawn" 'B' = TRUE,
 10 BOOL m_bSpawned = FALSE,
 11 INDEX m_ctSpawned = 0,
 12 FLOAT m_fSpawnDamage = 1e6f,
 13 BOOL m_bSpawnEnabled = FALSE,
 14 INDEX m_bCountAsKill = TRUE,

 23 CEntityPointer m_penWoundTarget "Wound target",
 
 16 BOOL  m_bDying = FALSE,  // are we currently dying
 17 FLOAT m_tmDeath = 1e6f,  // time when death begins
 18 FLOAT m_fDeathDuration = 0.0f, // length of death (for particles)
 19 BOOL m_bRenderParticles=FALSE,
 20 COLOR m_colParticles "Color of particles" = COLOR(C_WHITE|CT_OPAQUE),
{
  CEmiter m_emEmiter;
}


components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  4 class   CLASS_BLOOD_SPRAY  "Classes\\BloodSpray.ecl",
  5 class   CLASS_TWISTER       "Classes\\Twister.ecl",

 10 model   MODEL_AIRMAN           "ModelsF\\Enemies\\Airman\\Airman.mdl",
 11 texture TEXTURE_AIRMAN   "ModelsMP\\Enemies\\AirElemental\\Elemental.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\Enemies\\Airman\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\Enemies\\Airman\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "ModelsF\\Enemies\\Airman\\Sounds\\Wound.wav",
 53 sound   SOUND_FIREBALL  "ModelsF\\Enemies\\Airman\\Sounds\\FireBall.wav",
 54 sound   SOUND_FIREWIND  "ModelsF\\Enemies\\Airman\\Sounds\\FireWind.wav",
 55 sound   SOUND_DEATH     "ModelsF\\Enemies\\Airman\\Sounds\\Death.wav",
 56 sound   SOUND_ALIVE     "ModelsF\\Enemies\\Airman\\Sounds\\Alive.wav",
 57 sound   SOUND_KICK      "ModelsF\\Enemies\\Airman\\Sounds\\Melee.wav",
 58 sound   SOUND_EMERGE    "ModelsF\\Enemies\\Airman\\Sounds\\Emerge.wav",
 59 sound   SOUND_ANGER     "ModelsF\\Enemies\\Airman\\Sounds\\Anger.wav",
 60 sound   SOUND_EXPLOSION     "ModelsMP\\Enemies\\AirElemental\\Sounds\\Explosion.wav",

functions:
  void Read_t( CTStream *istr) // throw char *
  { 
    CEnemyBase::Read_t(istr);
    m_emEmiter.Read_t(*istr);
  }
  
  void Write_t( CTStream *istr) // throw char *
  { 
    CEnemyBase::Write_t(istr);
    m_emEmiter.Write_t(*istr);
  }

  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s was -*blown away*- by an Air Elemental"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\Airman.txt");
    return fnm;
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_FIREBALL);
    PrecacheSound(SOUND_FIREWIND);
    PrecacheSound(SOUND_ALIVE);
    PrecacheSound(SOUND_KICK);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_EMERGE);
    PrecacheSound(SOUND_ANGER);
    PrecacheSound(SOUND_EXPLOSION);  

    PrecacheModel(MODEL_AIRMAN);
    PrecacheTexture(TEXTURE_AIRMAN);
    if (m_airType == AIR_SMALL) {
      PrecacheClass(CLASS_PROJECTILE, PRT_AIRELEMENTAL_WIND_SMALL );  
    } else if (m_airType == AIR_BIG) {
      PrecacheClass(CLASS_PROJECTILE, PRT_AIRELEMENTAL_WIND );  
    } else {
      PrecacheClass(CLASS_PROJECTILE, PRT_AIRELEMENTAL_WIND_HUGE );  
    }
    PrecacheClass(CLASS_TWISTER);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_airType == AIR_SMALL) {
      return &eiAirmanSmall;
    } else if (m_airType == AIR_HUGE) {
      return &eiAirmanLarge;
    } else {
      return &eiAirmanBig;
    }
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // boss can't be telefragged
    if( m_airType==AIR_HUGE && dmtType==DMT_TELEPORT)
    {
      return;
    }


    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())/m_fSpawnDamage), INDEX(0), INDEX(10));
    CTString strChar = ElementalCharacter_enum.NameForValue(INDEX(m_airType));

    if (m_bSpawnEnabled && m_bSpawnWhenHarmed && (m_airType==AIR_HUGE || m_airType==AIR_BIG))
    {
      INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())/m_fSpawnDamage), INDEX(0), INDEX(10));
      if(m_ctSpawned<ctShouldSpawn)
      {
        SendEvent( EForceWound() );
      }
    }

    // if not in normal state can't be harmed
    if (m_AirCurrentState!=AIRS_NORMAL) {
      return;
    }
    
    // air elemental cannot be harmed by following kinds of damage:
    if(dmtType==DMT_CLOSERANGE ||
       dmtType==DMT_BULLET ||
       dmtType==DMT_IMPACT ||
       dmtType==DMT_CHAINSAW)
    {
      return;
    }

    // can't harm own class
    if (!IsOfClass(penInflictor, "Airman")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
    m_colBurning=COLOR(C_WHITE|CT_OPAQUE);
  };

  void LeaveStain( BOOL bGrow)
  {
    return;
  }


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    iAnim = AIRMAN_ANIM_WOUND;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    StartModelAnim(AIRMAN_ANIM_DEATH , 0);
    return AIRMAN_ANIM_DEATH;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(AIRMAN_COLLISION_BOX_PART_NAME);
    en_fDensity = 10.0f;
  };

  // virtual anim functions
  void StandingAnim(void) 
  {
      switch (m_AirCurrentState) {
        case AIRS_NORMAL: StartModelAnim(AIRMAN_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART); break;
        case AIRS_CLOUD: StartModelAnim(AIRMAN_ANIM_CLOUDIDLE, AOF_LOOPING|AOF_NORESTART); break;
        case AIRS_BOX: StartModelAnim(AIRMAN_ANIM_CLOUDIDLE, AOF_LOOPING|AOF_NORESTART); break;
		}
  };

  void WalkingAnim(void) 
  {
      if (m_airType==AIR_HUGE) {
        StartModelAnim(AIRMAN_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
      } else if (m_airType==AIR_BIG) {
        StartModelAnim(AIRMAN_ANIM_WALKMEDIUM, AOF_LOOPING|AOF_NORESTART);
      } else {
        StartModelAnim(AIRMAN_ANIM_WALKSMALL, AOF_LOOPING|AOF_NORESTART);
      }
    }

  void RunningAnim(void) {
    WalkingAnim();
  };
  void RotatingAnim(void) {
    RunningAnim();
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


  BOOL CountAsKill(void)
  {
    return m_bCountAsKill;
  }

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    if (m_bQuiet) { 
      m_soBackground.Set3DParameters(0.0f, 0.0f, 3.0f, 1.0f);
      m_soSound.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
      m_soPoof.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
	} else
    if (m_airType==AIR_HUGE)
    {
      m_soBackground.Set3DParameters(1000.0f, 10.0f, 5.0f, 1.0f);
      m_soSound.Set3DParameters(1000.0f, 50.0f, 1.0f, 1.0f);
      m_soPoof.Set3DParameters(1000.0f, 50.0f, 1.0f, 1.0f);
    }
    else if (m_airType==AIR_BIG)
    {
      m_soBackground.Set3DParameters(100.0f, 10.0f, 4.0f, 1.0f);
      m_soSound.Set3DParameters(300.0f, 20.0f, 1.0f, 1.0f);
      m_soPoof.Set3DParameters(300.0f, 20.0f, 1.0f, 1.0f);
    }
    else 
    {
      m_soBackground.Set3DParameters(50.0f, 2.0f, 2.0f, 1.0f);
      m_soSound.Set3DParameters(100.0f, 0.0f, 1.0f, 1.0f);
      m_soPoof.Set3DParameters(100.0f, 0.0f, 1.0f, 1.0f);
    }
  };

  void LaunchTwisterBig(FLOAT3D vEnemyOffset)
  {
    // calculate parameters for predicted angular launch curve
    FLOAT3D vFirePos = vTwisterLaunchPosBig*GetRotationMatrix();
    FLOAT3D vShooting = GetPlacement().pl_PositionVector + vFirePos;
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    
    // shoot in front of the enemy
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    
    // adjust target position
    vTarget += vEnemyOffset;

    CPlacement3D pl;
    CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1],
      vTarget, FLOAT3D(0.0f, 0.0f, 0.0f), 0.0f, fLaunchSpeed, fRelativeHdg);
    
    PrepareFreeFlyingProjectile(pl, vTarget, vFirePos, ANGLE3D( fRelativeHdg, 0.0f, 0.0f));
    
    ETwister et;
    CEntityPointer penTwister = CreateEntity(pl, CLASS_TWISTER);
    et.penOwner = this;
    et.fSize = 10.0f;
    et.fDuration = 5.0f + FRnd()+5.0f;
    et.sgnSpinDir = (INDEX)(Sgn(FRnd()-0.5f));
    et.bGrow = TRUE;
    et.bMovingAllowed=TRUE;
    penTwister->Initialize(et);
    
    ((CMovableEntity &)*penTwister).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -fLaunchSpeed*0.75f), (CMovableEntity*)(CEntity*)this);
  }

  void LaunchTwisterHuge(FLOAT3D vEnemyOffset)
  {
    // calculate parameters for predicted angular launch curve
    FLOAT3D vFirePos = vTwisterLaunchPosHuge*GetRotationMatrix();
    FLOAT3D vShooting = GetPlacement().pl_PositionVector + vFirePos;
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT fLaunchSpeed;
    FLOAT fRelativeHdg;
    
    // shoot in front of the enemy
    EntityInfo *peiTarget = (EntityInfo*) (m_penEnemy->GetEntityInfo());
    
    // adjust target position
    vTarget += vEnemyOffset;

    CPlacement3D pl;
    CalculateAngularLaunchParams( vShooting, peiTarget->vTargetCenter[1],
      vTarget, FLOAT3D(0.0f, 0.0f, 0.0f), 0.0f, fLaunchSpeed, fRelativeHdg);
    
    PrepareFreeFlyingProjectile(pl, vTarget, vFirePos, ANGLE3D( fRelativeHdg, 0.0f, 0.0f));
    
    ETwister et;
    CEntityPointer penTwister = CreateEntity(pl, CLASS_TWISTER);
    et.penOwner = this;
    et.fSize = 20.0f;
    et.fDuration = 15.0f + FRnd()+5.0f;
    et.sgnSpinDir = (INDEX)(Sgn(FRnd()-0.5f));
    et.bGrow = TRUE;
    et.bMovingAllowed=TRUE;
    penTwister->Initialize(et);
    
    ((CMovableEntity &)*penTwister).LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -fLaunchSpeed*0.75f), (CMovableEntity*)(CEntity*)this);
  }

  // spawn new elemental
  void SpawnNewElemental(void) 
  {
    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())/m_fSpawnDamage), INDEX(0), INDEX(10));
    // disable too much spawning
    if (m_bSpawnOnBlowUp && (m_airType==AIR_HUGE || m_airType==AIR_BIG) && (GetHealth()<=0.0f) )
    {
      ctShouldSpawn+=2;
    }

    ASSERT(m_ctSpawned<=ctShouldSpawn);
    if(m_ctSpawned>=ctShouldSpawn)
    {
      return;
    }

    CPlacement3D pl;
    // spawn placement
    if (m_airType==AIR_HUGE) {
      pl = CPlacement3D(AIRMAN_SPAWN_LARGE, ANGLE3D(-90.0f+FRnd()*180.0f, 30+FRnd()*30, 0));
    } else {
      pl = CPlacement3D(AIRMAN_SPAWN_BIG, ANGLE3D(-90.0f+FRnd()*180.0f, 40+FRnd()*20, 0));
    }
    pl.RelativeToAbsolute(GetPlacement());

    // create entity
    CEntityPointer pen = GetWorld()->CreateEntity(pl, GetClass());
    // elemental size
    if (m_airType==AIR_HUGE) {
      ((CAirman&)*pen).m_airType = AIR_BIG;
    } else {
      ((CAirman&)*pen).m_airType = AIR_SMALL;
    }
    // start properties
    ((CAirman&)*pen).m_AirStartState = AIRS_BOX;
    ((CAirman&)*pen).m_colParticles = m_colParticles;
    ((CAirman&)*pen).m_penEnemy = m_penEnemy;
    ((CAirman&)*pen).m_ttTarget = m_ttTarget;
    ((CAirman&)*pen).m_bSpawned = TRUE;
    pen->Initialize(EVoid());
    // set moving
    if (m_airType==AIR_HUGE) {
      ((CAirman&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -40.0f), this);
    } else {
      ((CAirman&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -20.0f), this);
    }
    ((CAirman&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));

    // spawn particle debris explosion
    CEntity *penSpray = CreateEntity( pl, CLASS_BLOOD_SPRAY);
    penSpray->SetParent( pen);
    ESpawnSpray eSpawnSpray;
    eSpawnSpray.fDamagePower = 4.0f;
    eSpawnSpray.fSizeMultiplier = 0.5f;
    eSpawnSpray.sptType = SPT_AIRSPOUTS;
    eSpawnSpray.vDirection = FLOAT3D(0,-0.5f,0);
    eSpawnSpray.colBurnColor=C_WHITE|CT_OPAQUE;
    eSpawnSpray.penOwner = pen;
    penSpray->Initialize( eSpawnSpray);
    m_ctSpawned++;
  };
  

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  // spawn body parts
  void BlowUp(void) {
    // get your size
  };

  void RenderParticles(void)
  {
   FLOAT fStretch;
    if(m_bRenderParticles)
    {
      if (m_airType==AIR_SMALL) {
        fStretch=0.2f;
        }
      if (m_airType==AIR_BIG) {
        fStretch=0.75f;
        }
      if (m_airType==AIR_HUGE) {
        fStretch=3.0f;
        }
    }
      Particles_AirElemental(this, fStretch, 1.0f, m_tmDeath, m_colParticles);
  }

/************************************************************
 *                     MOVING FUNCTIONS                     *
 ************************************************************/
  // check whether may move while attacking
  BOOL MayMoveToAttack(void) 
  {
      return CEnemyBase::WouldNotLeaveAttackRadius();
  }

procedures:
/************************************************************
 *                    CLASS INTERNAL                        *
 ************************************************************/
  FallOnFloor(EVoid) {
    // drop to floor
    SetPhysicsFlags(EPF_MODEL_WALKING);
    // wait at most 10 seconds
    wait (10.0f) {
      on (ETimer) : { stop; }
      on (EBegin) : { resume; }
      // if a brush is touched
      on (ETouch et) : {
        if (et.penOther->GetRenderType()&RT_BRUSH) {
          // stop waiting
          StopMoving();
          stop;
        }
        resume;
      }
      otherwise() : { resume; }
    }
    StartModelAnim(AIRMAN_ANIM_CLOUDEMERGE, 0);
    return EReturn();
  };

/************************************************************
 *                 CHANGE STATE PROCEDURES                  *
 ************************************************************/

  // plane to normal
  PlaneToNormal(EVoid) {
    m_AirCurrentState = AIRS_NORMAL;
    SwitchToModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_AIR);
    GetModelObject()->mo_colBlendColor = C_WHITE|0x50;
    ChangeCollisionBoxIndexWhenPossible(AIRMAN_COLLISION_BOX_PART_NAME);
    PlaySound(m_soSound, SOUND_EMERGE, SOF_3D);
    INDEX iAnim;
    iAnim = AIRMAN_ANIM_CLOUDEMERGE;
    StartModelAnim(iAnim, 0);
    autowait(GetModelObject()->GetAnimLength(iAnim));
    return EReturn();
  };
   // box to normal
  BoxToNormal(EVoid) {
    m_AirCurrentState = AIRS_NORMAL;
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_AIR);
    GetModelObject()->mo_colBlendColor = C_WHITE|0x50;
    ChangeCollisionBoxIndexWhenPossible(AIRMAN_COLLISION_BOX_PART_NAME);
    PlaySound(m_soSound, SOUND_EMERGE, SOF_3D);
    StartModelAnim(AIRMAN_ANIM_CLOUDEMERGE, 0);
    autowait(GetModelObject()->GetAnimLength(AIRMAN_ANIM_CLOUDEMERGE));
    return EReturn();
  };


/************************************************************
 *                PROCEDURES WHEN HARMED                    *
 ************************************************************/
  // Play wound animation and falling body part
  BeWounded(EDamage eDamage) : CEnemyBase::BeWounded {
    // spawn additional elemental
    if( m_bSpawnEnabled)
    {
      SpawnNewElemental();
    }
    if (m_penWoundTarget) {
        SendToTarget(m_penWoundTarget, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
    }
    jump CEnemyBase::BeWounded(eDamage);
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  InitializeAttack(EVoid) : CEnemyBase::InitializeAttack {
    // change state from box to normal
    if (m_AirCurrentState==AIRS_BOX)
    {
      autocall BoxToNormal() EReturn;
    }
    // change state from plane to normal
    if (m_AirCurrentState==AIRS_CLOUD)
    {
      autocall PlaneToNormal() EReturn;
    }
    jump CEnemyBase::InitializeAttack();
  };

  Fire(EVoid) : CEnemyBase::Fire
  {   
    m_bSpawnEnabled = TRUE;

    if( m_airType == AIR_SMALL)
    { 
      StartModelAnim(AIRMAN_ANIM_FIREBALL , 0);  
      PlaySound(m_soSound, SOUND_FIREBALL, SOF_3D);

      autowait(0.6f);

      ShootProjectile(PRT_AIRELEMENTAL_WIND_SMALL, FLOAT3D( 0.0f, 3.5f, 0.0f), ANGLE3D(0, 0, 0));
      autowait(1.65f);

      MaybeSwitchToAnotherPlayer(); 
      return EReturn();
    }
    if( m_airType == AIR_BIG)
    { 
	  if (m_attType == ATT_BOTH) {
          INDEX iRnd = IRnd()%2;
          switch(iRnd)
            {
          case 0:
            jump BigBall();
            break;
          case 1:
            jump BigTwister();
            break;
	   	    }
		  }
	  if (m_attType == ATT_BALLS) {
          jump BigBall(); }
	  if (m_attType == ATT_WIND) {
          jump BigTwister(); }
    }

    if( m_airType == AIR_HUGE)
    { 
	  if (m_attType == ATT_BOTH) {
          INDEX iRnd = IRnd()%2;
          switch(iRnd)
            {
          case 0:
            jump HugeBall();
            break;
          case 1:
            jump HugeTwister();
            break;
	   	    }
		  }
	  if (m_attType == ATT_BALLS) {
          jump HugeBall(); }
	  if (m_attType == ATT_WIND) {
          jump HugeTwister(); }
    }
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      StartModelAnim(AIRMAN_ANIM_MELEE, 0);
      PlaySound(m_soSound, SOUND_KICK, SOF_3D);
	  autowait(0.85f);
	  FLOAT3D vSource;
      vSource = GetPlacement().pl_PositionVector +
      FLOAT3D(m_penEnemy->en_mRotation(1, 2), m_penEnemy->en_mRotation(2, 2), m_penEnemy->en_mRotation(3, 2));
      {
        FLOAT3D mDirection;
          if (m_airType == AIR_SMALL) {
        InflictRangeDamage(this, DMT_IMPACT, 15.0f, vSource, m_fStopDistance, m_fCloseDistance);
        GetPitchDirection(AngleDeg(15.0f), mDirection-90); }
          if (m_airType == AIR_BIG) {
        InflictRangeDamage(this, DMT_IMPACT, 30.0f, vSource, m_fStopDistance, m_fCloseDistance);
        GetPitchDirection(AngleDeg(30.0f), mDirection-90); }
          if (m_airType == AIR_HUGE) {
        InflictRangeDamage(this, DMT_IMPACT, 60.0f, vSource, m_fStopDistance, m_fCloseDistance);
        GetPitchDirection(AngleDeg(60.0f), mDirection-90); }

        KickEntity(m_penEnemy, 0.0);
      }
    }
    autowait(1.25f);
    MaybeSwitchToAnotherPlayer();
    return EReturn();
  };


  BigBall(EVoid){
      StartModelAnim(AIRMAN_ANIM_FIREBALL , 0);  
      PlaySound(m_soSound, SOUND_FIREBALL, SOF_3D);

      autowait(0.6f);

    // calculate predicted position
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT3D vSpeedDst = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    m_vDesiredPosition = CalculatePredictedPosition(GetPlacement().pl_PositionVector, vTarget, 60,
      vSpeedDst, GetPlacement().pl_PositionVector(2) );
    // shoot predicted propelled projectile
    ShootPredictedProjectile(PRT_AIRELEMENTAL_WIND, m_vDesiredPosition, FLOAT3D( -15.0f, 12.5f, 0.0f), ANGLE3D(-15, 0, 0));
    ShootPredictedProjectile(PRT_AIRELEMENTAL_WIND, m_vDesiredPosition, FLOAT3D( 0.0f, 12.5f, 0.0f), ANGLE3D(0, 0, 0));
    ShootPredictedProjectile(PRT_AIRELEMENTAL_WIND, m_vDesiredPosition, FLOAT3D( 15.0f, 12.5f, 0.0f), ANGLE3D(15, 0, 0));
      autowait(1.65f);

    MaybeSwitchToAnotherPlayer(); 
    return EReturn();
    };

  HugeBall(EVoid){
      StartModelAnim(AIRMAN_ANIM_FIREBALL , 0);  
      PlaySound(m_soSound, SOUND_FIREBALL, SOF_3D);

      autowait(0.6f);

    // calculate predicted position
    FLOAT3D vTarget = m_penEnemy->GetPlacement().pl_PositionVector;
    FLOAT3D vSpeedDst = ((CMovableEntity&) *m_penEnemy).en_vCurrentTranslationAbsolute;
    m_vDesiredPosition = CalculatePredictedPosition(GetPlacement().pl_PositionVector, vTarget, 60,
      vSpeedDst, GetPlacement().pl_PositionVector(2) );
    // shoot predicted propelled projectile
    ShootPredictedProjectile(PRT_AIRELEMENTAL_WIND_HUGE, m_vDesiredPosition, FLOAT3D( -30.0f, 40.5f, 0.0f), ANGLE3D(-10, 0, 0));
    ShootPredictedProjectile(PRT_AIRELEMENTAL_WIND_HUGE, m_vDesiredPosition, FLOAT3D( -15.0f, 40.5f, 0.0f), ANGLE3D(-5, 0, 0));
    ShootPredictedProjectile(PRT_AIRELEMENTAL_WIND_HUGE, m_vDesiredPosition, FLOAT3D( 0.0f, 40.5f, 0.0f), ANGLE3D(0, 0, 0));
    ShootPredictedProjectile(PRT_AIRELEMENTAL_WIND_HUGE, m_vDesiredPosition, FLOAT3D( 15.0f, 40.5f, 0.0f), ANGLE3D(5, 0, 0));
    ShootPredictedProjectile(PRT_AIRELEMENTAL_WIND_HUGE, m_vDesiredPosition, FLOAT3D( 30.0f, 40.5f, 0.0f), ANGLE3D(10, 0, 0));

      autowait(1.65f);

    MaybeSwitchToAnotherPlayer(); 
    return EReturn();
    };

  BigTwister(EVoid){
      StartModelAnim(AIRMAN_ANIM_FIREWIND , 0);  
      PlaySound(m_soSound, SOUND_FIREWIND, SOF_3D);

      autowait(1.0f);;

    FLOAT3D vOffset;
    // static enemy
    if (((CMovableEntity &)*m_penEnemy).en_vCurrentTranslationAbsolute.Length()==0.0f) {
      // almost directly at the enemy
      FLOAT3D vPlayerToThis = GetPlacement().pl_PositionVector - m_penEnemy->GetPlacement().pl_PositionVector;
      vPlayerToThis.Normalize();
      vOffset = FLOAT3D(vPlayerToThis);
      LaunchTwisterBig(vOffset);
    // moving enemy
    } else {
      FLOAT3D vPlayerSpeed = ((CMovableEntity &)*m_penEnemy).en_vCurrentTranslationAbsolute;
      if (vPlayerSpeed.Length()>15.0f) {
        vPlayerSpeed.Normalize();
        vPlayerSpeed = vPlayerSpeed;
      }
      vOffset = vPlayerSpeed;
      FLOAT3D vToPlayer = ((CMovableEntity &)*m_penEnemy).GetPlacement().pl_PositionVector - GetPlacement().pl_PositionVector;
      vToPlayer.Normalize();
      vOffset -= vToPlayer;
      LaunchTwisterBig(vOffset);
    }
      
    autowait(1.0f);

    MaybeSwitchToAnotherPlayer();
    return EReturn();
    };

  HugeTwister(EVoid){
      StartModelAnim(AIRMAN_ANIM_FIREWIND , 0);  
      PlaySound(m_soSound, SOUND_FIREWIND, SOF_3D);

      autowait(1.0f);;

    FLOAT3D vOffset;
    // static enemy
    if (((CMovableEntity &)*m_penEnemy).en_vCurrentTranslationAbsolute.Length()==0.0f) {
      // almost directly at the enemy
      FLOAT3D vPlayerToThis = GetPlacement().pl_PositionVector - m_penEnemy->GetPlacement().pl_PositionVector;
      vPlayerToThis.Normalize();
      vOffset = FLOAT3D(vPlayerToThis);
      LaunchTwisterHuge(vOffset);
      // to the left
      vOffset = FLOAT3D(-(FRnd()*5.0f-30.0f), 0.0f, (FRnd()-0.5f)*20.0f)*((CMovableEntity &)*m_penEnemy).GetRotationMatrix();
      LaunchTwisterHuge(vOffset);
      // to the right
      vOffset = FLOAT3D(+(FRnd()*5.0f+30.0f), 0.0f, 20.0f)*((CMovableEntity &)*m_penEnemy).GetRotationMatrix();
      LaunchTwisterHuge(vOffset);
    // moving enemy
    } else {
      FLOAT3D vPlayerSpeed = ((CMovableEntity &)*m_penEnemy).en_vCurrentTranslationAbsolute;
      if (vPlayerSpeed.Length()>15.0f) {
        vPlayerSpeed.Normalize();
        vPlayerSpeed = vPlayerSpeed;
      }
      vOffset = vPlayerSpeed;
      FLOAT3D vToPlayer = ((CMovableEntity &)*m_penEnemy).GetPlacement().pl_PositionVector - GetPlacement().pl_PositionVector;
      vToPlayer.Normalize();
      vOffset -= vToPlayer;
      LaunchTwisterHuge(vOffset);
      LaunchTwisterHuge(vOffset+FLOAT3D(-30.0f-FRnd()*5.0f, 0.0f, -30.0f-FRnd()*5.0f));
      LaunchTwisterHuge(vOffset+FLOAT3D(+30.0f+FRnd()*5.0f, 0.0f, -30.0f-FRnd()*5.0f));
    }
      
    autowait(1.0f);

    MaybeSwitchToAnotherPlayer();
    return EReturn();
    };

/************************************************************
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death
  {
    if (m_bSpawnOnBlowUp && (m_airType==AIR_HUGE || m_airType==AIR_BIG)) {
      SpawnNewElemental();
      SpawnNewElemental();
    }
    autocall CEnemyBase::Death() EEnd;

    m_tmDeath = _pTimer->CurrentTick();
    PlaySound(m_soPoof, SOUND_EXPLOSION, SOF_3D);
    SwitchToEditorModel();

    return EEnd();
  }

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop
  {
    // if spawned by other entity
    if (m_bSpawned) {
      m_bSpawned = FALSE;
      m_bCountAsKill = FALSE;
      // wait till touching the ground
      autocall FallOnFloor() EReturn;
    }
    PlaySound(m_soBackground, SOUND_ALIVE, SOF_3D|SOF_LOOP);
    return EReturn();
  }

/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_WALKING);
    SetCollisionFlags(ECF_AIR);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_fDensity = 100.0f;
    m_sptType = SPT_AIRSPOUTS;
    m_bBoss = m_bAirBoss;

    // set your appearance
    SetModel(MODEL_AIRMAN);
    SetModelMainTexture(TEXTURE_AIRMAN);
    StandingAnim();
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);
    m_fBlowUpAmount = 1E30f;
	
    m_bRenderParticles=TRUE;

    m_emEmiter.Initialize(this);
    m_emEmiter.em_etType=ET_AIR_ELEMENTAL;
    
    m_tmDeath = 1e6f;

    // damage/explode properties
    if (m_airType == AIR_SMALL)
    {
      SetHealth(160.0f);
      m_fMaxHealth = 160.0f;
      m_fSpawnDamage = 1e6f;
      // setup moving speed
      m_fWalkSpeed = FRnd() + 1.5f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 25.0f);
      m_fAttackRunSpeed = FRnd() + 16.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 500.0f);
      m_fCloseRunSpeed = FRnd() + 16.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 500.0f);
      // setup attack distances
      m_fAttackDistance = 500.0f;
      m_fCloseDistance = 30.0f;
      m_fStopDistance = 15.0f;
      m_fAttackFireTime = 3.0f;
      m_fCloseFireTime = 1.5f;
      m_fIgnoreRange = 200.0f;
      // damage/explode properties
      m_iScore = 2000;
      m_fDamageWounded = 1e6f;
    }
    else if (m_airType == AIR_BIG)
    {
      SetHealth(1200.0f);
      m_fMaxHealth = 1200.0f;
      // after loosing this ammount of damage we will spawn new elemental
      m_fSpawnDamage = 450.0f;
      // setup moving speed
      m_fWalkSpeed = FRnd() + 3.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 25.0f);
      m_fAttackRunSpeed = FRnd() + 12.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 300.0f);
      m_fCloseRunSpeed = FRnd() + 12.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 300.0f);
      // setup attack distances
      m_fAttackDistance = 2000.0f;
      m_fCloseDistance = 50.0f;
      m_fStopDistance = 25.0f;
      m_fAttackFireTime = 5.0f;
      m_fCloseFireTime = 3.0f;
      m_fIgnoreRange = 400.0f;
      // damage/explode properties
      m_iScore = 8000;
      m_fDamageWounded = 1e6f;
    }
    else // HUGE
    {
      SetHealth(10000.0f);
      m_fMaxHealth = 10000.0f;
      // after loosing this ammount of damage we will spawn new elemental
      m_fSpawnDamage = 2000.0f;
      // setup moving speed
      m_fWalkSpeed = FRnd() + 6.0f;
      m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 25.0f);
      m_fAttackRunSpeed = FRnd() + 6.0f;
      m_aAttackRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
      m_fCloseRunSpeed = FRnd() + 6.0f;
      m_aCloseRotateSpeed = AngleDeg(FRnd()*50 + 245.0f);
      // setup attack distances
      m_fAttackDistance = 2000.0f;
      m_fCloseDistance = 80.0f;
      m_fStopDistance = 40.0f;
      m_fAttackFireTime = 5.0f;
      m_fCloseFireTime = 6.0f;
      m_fIgnoreRange = 600.0f;
      m_iScore = 100000;
      m_fDamageWounded = 1e6f;
    }
    
    m_fMaxHealth = GetHealth();

    // state and flare attachments
    m_AirCurrentState = m_AirStartState;
    switch (m_AirCurrentState) {
      case AIRS_NORMAL:
        SetCollisionFlags(ECF_AIR);
        SetPhysicsFlags(EPF_MODEL_WALKING);
        GetModelObject()->mo_colBlendColor = C_WHITE|0x75;
        break;
      case AIRS_CLOUD:
        SetCollisionFlags(ECF_IMMATERIAL);
        SetPhysicsFlags(EPF_MODEL_IMMATERIAL|EPF_MOVABLE);
        GetModelObject()->mo_colBlendColor = C_BLACK|0x75;
        break;
      case AIRS_BOX:
        SetPhysicsFlags(EPF_BOX_PLANE_ELEMENTAL);
        SetCollisionFlags(ECF_AIR);
        break;
    }
    StandingAnim();

    // stretch
    if (m_airType==AIR_SMALL) {
      GetModelObject()->StretchModel(FLOAT3D(AIR_SMALL_STRETCH, AIR_SMALL_STRETCH, AIR_SMALL_STRETCH));
    }
    else if (m_airType==AIR_HUGE) {
      GetModelObject()->StretchModel(FLOAT3D(AIR_LARGE_STRETCH, AIR_LARGE_STRETCH, AIR_LARGE_STRETCH));
    } else if (m_airType==AIR_BIG) {
      GetModelObject()->StretchModel(FLOAT3D(AIR_BIG_STRETCH, AIR_BIG_STRETCH, AIR_BIG_STRETCH));
    }
    ModelChangeNotify();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
