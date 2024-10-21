335
%{
#include "StdH.h"
#include "ModelsF/t3dgm/Jaws/Jaws.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiJaws = {
  EIBT_FLESH, 100.0f,
  0.0f, 1.3f, 0.0f,     // source (eyes)
  0.0f, 1.0f, 0.0f,     // target (body)
};

#define EXPLODE_JAWS   2.5f
%}

class CJaws: CEnemyBase {
name      "Jaws";
thumbnail "Thumbnails\\Jaws.tbn";

properties:
  // class internal
  1 BOOL m_bExploded = FALSE,
  
components:
  1 class   CLASS_BASE            "Classes\\EnemyBase.ecl",
  2 class   CLASS_BLOOD_SPRAY     "Classes\\BloodSpray.ecl",
  3 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** DATA **************
 10 model   MODEL_JAWS           "ModelsF\\t3dgm\\Jaws\\Jaws.mdl",
 20 texture TEXTURE_JAWS         "ModelsF\\t3dgm\\Jaws\\jawsbrown.tex",

 11 model   MODEL_LEG           "ModelsF\\t3dgm\\Jaws\\Debris\\Leg.mdl",

 33 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 34 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",
 
 50 sound   SOUND_IDLE            "ModelsF\\t3dgm\\Jaws\\Sounds\\Idle.wav",
 51 sound   SOUND_JUMP            "ModelsF\\t3dgm\\Jaws\\Sounds\\Jump.wav",
 52 sound   SOUND_DEATH_JUMP      "ModelsF\\t3dgm\\Jaws\\Sounds\\Attack.wav",
 53 sound   SOUND_SIGHT           "ModelsF\\t3dgm\\Jaws\\Sounds\\Sight.wav",
 54 sound   SOUND_DEATH           "ModelsF\\t3dgm\\Jaws\\Sounds\\Death.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s got consumed by a nulling"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnm, "DataF\\Messages\\Enemies\\Jaws.txt");
    return fnm;
  };
  /* Entity info */
  void *GetEntityInfo(void)
  {
    return &eiJaws;
  };

  void Precache(void)
  {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_IDLE);
    PrecacheSound(SOUND_JUMP);
    PrecacheSound(SOUND_DEATH_JUMP);
    PrecacheSound(SOUND_DEATH);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_GIZMO_SPLASH_FX);
    PrecacheClass(CLASS_BLOOD_SPRAY);

    PrecacheModel(MODEL_LEG);
    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // jaws can't harm jaws
    if (!IsOfClass(penInflictor, "Jaws")) {
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
    switch (IRnd()%3) {
      case 0: iAnim = JAWS_ANIM_DEATH1; break;
      case 1: iAnim = JAWS_ANIM_DEATH2; break;
      case 2: iAnim = JAWS_ANIM_DEATH3; break;
      default: ASSERTALWAYS("Jaws unknown death");
    }
    StartModelAnim(iAnim, 0);
    return iAnim;
  };
  void RunningAnim(void)
  {
    StartModelAnim(JAWS_ANIM_RUN, 0);
  };
  void MortalJumpAnim(void)
  {
    StartModelAnim(JAWS_ANIM_ATTACK, 0);
  };
  void StandingAnim(void)
  {
    StartModelAnim(JAWS_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };
  void WalkingAnim(void) {
    StartModelAnim(JAWS_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, SOUND_IDLE, SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, SOUND_SIGHT, SOF_3D);
  };
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };

  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    if (m_bQuiet) { 
    m_soSound.Set3DParameters(0.0f, 0.0f, 2.0f, 1.0f);
	} else {
    m_soSound.Set3DParameters(80.0f, 5.0f, 0.5f, 1.0f);
	}
  };

/************************************************************
 *                 BLOW UP FUNCTIONS                        *
 ************************************************************/
  void BlowUp(void) {
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
    FLOAT fEntitySize = box.Size().MaxNorm();

    FLOAT3D vNormalizedDamage = m_vDamage-m_vDamage*(m_fBlowUpAmount/m_vDamage.Length());
    vNormalizedDamage /= Sqrt(vNormalizedDamage.Length());

    vNormalizedDamage *= 1.0f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

      ULONG ulFleshTexture = TEXTURE_FLESH_RED;
      ULONG ulFleshModel   = MODEL_FLESH;

    Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);


    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_JAWS, 0, 0, 0, IRnd()%4, 0.5,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_LEG, TEXTURE_JAWS, 0, 0, 0, IRnd()%4, 0.5,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));

      for( INDEX iDebris = 0; iDebris<m_fBodyParts; iDebris++) {
        Debris_Spawn( this, this, ulFleshModel, ulFleshTexture, 0, 0, 0, IRnd()%4, 0.25f,
                      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
					  }

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
  };


  // leave stain
  virtual void LeaveStain(BOOL bGrow)
  {
    ESpawnEffect ese;
    FLOAT3D vPoint;
    FLOATplane3D vPlaneNormal;
    FLOAT fDistanceToEdge;
    // get your size
    FLOATaabbox3D box;
    GetBoundingBox(box);
  
    // on plane
    if( GetNearestPolygon(vPoint, vPlaneNormal, fDistanceToEdge))
    {
      // if near to polygon and away from last stain point
      if( (vPoint-GetPlacement().pl_PositionVector).Length()<0.5f )
      {
        FLOAT fStretch = box.Size().Length();
        // stain
        ese.colMuliplier = C_WHITE|CT_OPAQUE;
        ese.betType    = BET_BLOODSTAIN;
        ese.vStretch   = FLOAT3D( fStretch*0.75f, fStretch*0.75f, 1.0f);
        ese.vNormal    = FLOAT3D( vPlaneNormal);
        ese.vDirection = FLOAT3D( 0, 0, 0);
        FLOAT3D vPos = vPoint+ese.vNormal/50.0f*(FRnd()+0.5f);
        CEntityPointer penEffect = CreateEntity( CPlacement3D(vPos, ANGLE3D(0,0,0)), CLASS_BASIC_EFFECT);
        penEffect->Initialize(ese);
      }
    }
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  // close range -> move toward enemy and try to jump onto it
  PerformAttack(EVoid) : CEnemyBase::PerformAttack
  {
    while (TRUE)
    {
      // ------------ Exit close attack if out of range or enemy is dead
      // if attacking is futile
      if (ShouldCeaseAttack())
      {
        SetTargetNone();
        return EReturn();
      }
      
      // stop moving
      SetDesiredTranslation(FLOAT3D(0.0f, 0.0f, 0.0f));
      SetDesiredRotation(ANGLE3D(0, 0, 0));

      // ------------ Wait for some time on the ground
      FLOAT fWaitTime = 0.25f+FRnd()*0.4f;
      wait( fWaitTime)
      {
        on (EBegin) : { resume; };
        on (ESound) : { resume; }     // ignore all sounds
        on (EWatch) : { resume; }     // ignore watch
        on (ETimer) : { stop; }       // timer tick expire
      }

      autocall JumpOnce() EReturn;
    }
  }

  JumpOnce(EVoid)
  {
    // ------------ Jump either in slightly randomized direction or mortal, streight and fast toward enemy
    // we are always going for enemy
    m_vDesiredPosition = m_penEnemy->GetPlacement().pl_PositionVector;
    m_fMoveFrequency = 0.1f;
    // if we are close enough for mortal jump
    if( CalcPlaneDist(m_penEnemy) < 10.0f)
    {
      // set mortal jump parameters (no random)
      m_fMoveSpeed = m_fCloseRunSpeed*1.5f;
      m_aRotateSpeed = m_aCloseRotateSpeed*0.5f;
      FLOAT fSpeedX = 0.0f;
      FLOAT fSpeedY = 5.0f;
      FLOAT fSpeedZ = -m_fMoveSpeed;
      // if can't see enemy
      if( !IsInFrustum(m_penEnemy, CosFast(30.0f)))
      {
        // rotate a lot
        m_aRotateSpeed = m_aCloseRotateSpeed*1.5f;
        // but don't jump too much
        fSpeedY /= 2.0f;
        fSpeedZ /= 4.0f;
        PlaySound(m_soSound, SOUND_JUMP, SOF_3D);
      }
      else
      {
        PlaySound(m_soSound, SOUND_DEATH_JUMP, SOF_3D);
      }
      FLOAT3D vTranslation(fSpeedX, fSpeedY, fSpeedZ);
      SetDesiredTranslation(vTranslation);
      MortalJumpAnim();
    }
    // start slightly randomized jump
    else
    {
      m_fMoveSpeed = m_fCloseRunSpeed;
      m_aRotateSpeed = m_aCloseRotateSpeed;
      // set random jump parameters
      FLOAT fSpeedX = (FRnd()-0.5f)*10.0f;
      FLOAT fSpeedY = FRnd()*4.0f+4.0f;
      FLOAT fSpeedZ = -m_fMoveSpeed-FRnd()*2.5f;
      FLOAT3D vTranslation(fSpeedX, fSpeedY, fSpeedZ);
      SetDesiredTranslation(vTranslation);
      RunningAnim();
      PlaySound(m_soSound, SOUND_JUMP, SOF_3D);
    }

    // ------------ While in air, adjust directions, on touch start new jump or explode
    while (TRUE)
    {
      // adjust direction and speed
      m_fMoveSpeed = 0.0f;
      m_aRotateSpeed = m_aCloseRotateSpeed;
      FLOAT3D vTranslation = GetDesiredTranslation();
      SetDesiredMovement(); 
      SetDesiredTranslation(vTranslation);

      wait(m_fMoveFrequency)
      {
        on (EBegin) : { resume; };
        on (ESound) : { resume; }     // ignore all sounds
        on (EWatch) : { resume; }     // ignore watch
        on (ETimer) : { stop; }       // timer tick expire
        on (ETouch etouch) :
        {
          // if we touched ground
          if( etouch.penOther->GetRenderType() & RT_BRUSH)
          {
            return EReturn();
          }
          // we touched player, explode
          else if ( IsDerivedFromClass( etouch.penOther, "Player"))
          {            
            InflictDirectDamage(etouch.penOther, this, DMT_IMPACT, 2.5f,
              GetPlacement().pl_PositionVector, -en_vGravityDir);
          }
          // we didn't touch ground nor player, ignore
          resume;
        }
      }
    }
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
    SetHealth(15.0f);
    m_fMaxHealth = 15.0f;
    en_tmMaxHoldBreath = 5.0f;
    en_fDensity = 1000.0f;
    m_fBlowUpSize = 2.0f;

    // set your appearance
    SetModel(MODEL_JAWS);
    SetModelMainTexture(TEXTURE_JAWS);
    // setup moving speed
    m_fWalkSpeed = FRnd() + 1.5f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*10.0f + 500.0f);
    m_fAttackRunSpeed = FRnd()*5.0f + 15.0f;
    m_aAttackRotateSpeed = AngleDeg(FRnd()*100 + 600.0f);
    m_fCloseRunSpeed = FRnd()*5.0f + 10.0f;
    m_aCloseRotateSpeed = AngleDeg(360.0f);
    // setup attack distances
    m_fAttackDistance = 400.0f;
    m_fCloseDistance = 250.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 2.0f;
    m_fCloseFireTime = 0.5f;
    m_fIgnoreRange = 500.0f;
    // damage/explode properties
    m_fBlowUpAmount = 40.0f;
    m_fBodyParts = 4;
    m_fDamageWounded = 0.0f;
    m_iScore = 400;
    m_sptType = SPT_BLOOD;

    en_fDeceleration = 150.0f;

    // set stretch factors for height and width
    GetModelObject()->StretchModel(FLOAT3D(1.0f, 1.0f, 1.0f));
    ModelChangeNotify();
    StandingAnim();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
