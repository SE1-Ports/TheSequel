340
%{
#include "StdH.h"
#include "ModelsF/Enemies/Mental/Mental.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/BasicEffects";

%{
// info structure
static EntityInfo eiMental = {
  EIBT_FLESH, 200000.0f,
  0.0f, 1.5f, 0.0f,     // source (eyes)
  0.0f, 1.0f, 0.0f,     // target (body)
};

%}

class CMental: CEnemyFly {
name      "Mental";
thumbnail "Thumbnails\\Mental.tbn";

properties:
  // class internal

  3 BOOL  m_bInvulnerable "Invulnerable" = TRUE,
  4 FLOAT m_fInvStop "Invul stop" = 10000.0f,
  5 FLOAT m_fPhase1Health "Full Health" = 30000.0f,
  6 FLOAT m_fPhase2Health "Phase 2 Health" = 20000.0f,
  7 FLOAT m_fPhase3Health "Phase 3 Health" = 10000.0f,

 10 CEntityPointer m_penPhase1Attack1 "Phase 1 Attack 1",
 11 CEntityPointer m_penPhase1Attack2 "Phase 1 Attack 2",
 12 CEntityPointer m_penPhase1Attack3 "Phase 1 Attack 3",

 13 CEntityPointer m_penPhase2Attack1 "Phase 2 Attack 1",
 14 CEntityPointer m_penPhase2Attack2 "Phase 2 Attack 2",
 15 CEntityPointer m_penPhase2Attack3 "Phase 2 Attack 3",

 16 CEntityPointer m_penPhase3Attack1 "Phase 3 Attack 1",
 17 CEntityPointer m_penPhase3Attack2 "Phase 3 Attack 2",
 18 CEntityPointer m_penPhase3Attack3 "Phase 3 Attack 3",
 
 19 FLOAT m_fAttackFireTime     "Attack Frequency" = 0.0f, 

 25 ANGLE3D m_aShadingDirection "Light direction" 'D' = ANGLE3D( AngleDeg(45.0f),AngleDeg(45.0f),AngleDeg(45.0f)),
 26 COLOR m_colLight            "Light color" 'O' = C_WHITE,
 27 COLOR m_colAmbient          "Ambient color" 'A' = C_BLACK,

components:
  1 class   CLASS_BASE            "Classes\\EnemyFly.ecl",
  2 class   CLASS_BLOOD_SPRAY     "Classes\\BloodSpray.ecl",
  3 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",

// ************** DATA **************
 10 model   MODEL_MENTAL          "ModelsF\\Enemies\\Mental\\Mental.mdl",
 11 texture TEXTURE_MENTAL        "ModelsF\\Enemies\\Mental\\Mental.tex",
 12 model   MODEL_HEAD            "ModelsMP\\Enemies\\Mental\\Head.mdl",
 18 texture TEXTURE_HEAD          "ModelsF\\Enemies\\Mental\\Head.tex",

 13 sound   SOUND_DEATH        "ModelsF\\Enemies\\Mental\\Sounds\\Death.wav",
 14 sound   SOUND_WOUND        "ModelsF\\Enemies\\Mental\\Sounds\\Wound.wav",
 15 sound   SOUND_ATTACK1      "ModelsF\\Enemies\\Mental\\Sounds\\Attack1.wav",
 16 sound   SOUND_ATTACK2      "ModelsF\\Enemies\\Mental\\Sounds\\Attack2.wav",
 17 sound   SOUND_ATTACK3      "ModelsF\\Enemies\\Mental\\Sounds\\Attack3.wav",

functions:

  /* Entity info */
  void *GetEntityInfo(void)
  {
    return &eiMental;
  };

  void Precache(void)
  {
    CEnemyBase::Precache();
	PrecacheModel(MODEL_MENTAL);
    PrecacheTexture(TEXTURE_MENTAL);
	PrecacheModel(MODEL_HEAD);
    PrecacheTexture(TEXTURE_HEAD);
      PrecacheSound(SOUND_DEATH);
      PrecacheSound(SOUND_WOUND);
      PrecacheSound(SOUND_ATTACK1);
      PrecacheSound(SOUND_ATTACK2);
      PrecacheSound(SOUND_ATTACK3);
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    
    // while we are invulnerable, receive no damage
    if (m_bInvulnerable == TRUE) {
      if(dmtType!=DMT_DAMAGER  && GetHealth() >= m_fInvStop)
      {
      return;
      }
    }

    // boss cannot be telefragged
    if(dmtType==DMT_TELEPORT)
    {
      return;
    }

    // _ can't harm _
    if (!IsOfClass(penInflictor, "Mental")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }

    // bosses don't darken when burning
    m_colBurning=COLOR(C_WHITE|CT_OPAQUE);
  };

  /* Adjust model shading parameters if needed. */
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    colLight   = m_colLight;
    colAmbient = m_colAmbient;
    vLightDirection = -vLightDirection;
    AnglesToDirectionVector(m_aShadingDirection, vLightDirection);
    return CMovableModelEntity::AdjustShadingParameters(vLightDirection, colLight, colAmbient);
  }

  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    iAnim = MENTAL_ANIM_WOUND;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    iAnim = MENTAL_ANIM_DEATH;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(MENTAL_COLLISION_BOX_DEAD);
    en_fDensity = 50000.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(MENTAL_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  // virtual sound functions
  void WoundSound(void) {
    PlaySound(m_soSound, SOUND_WOUND, SOF_3D);
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
    m_soSound.Set3DParameters(1000.0f, 100.0f, 2.0f, 1.0f);
	}
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  FlyFire(EVoid) : CEnemyFly::FlyFire {
   if( GetHealth() > m_fPhase2Health) {
    INDEX iRnd = IRnd()%3;
    switch(iRnd)
    {
    case 0:
        StartModelAnim(MENTAL_ANIM_ATTACKSWIPE, 0);
        PlaySound(m_soSound, SOUND_ATTACK1, SOF_3D);
        SendToTarget(m_penPhase1Attack1, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
    case 1:
        StartModelAnim(MENTAL_ANIM_ATTACKDOWN, 0);
        PlaySound(m_soSound, SOUND_ATTACK2, SOF_3D);
        SendToTarget(m_penPhase1Attack2, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
    case 2:
        StartModelAnim(MENTAL_ANIM_ATTACKPOINT, 0);
        PlaySound(m_soSound, SOUND_ATTACK3, SOF_3D);
        SendToTarget(m_penPhase1Attack3, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
     }
	}

   if( GetHealth() <= m_fPhase2Health && GetHealth() > m_fPhase3Health)  {
    INDEX iRnd = IRnd()%3;
    switch(iRnd)
    {
    case 0:
        StartModelAnim(MENTAL_ANIM_ATTACKSWIPE, 0);
        PlaySound(m_soSound, SOUND_ATTACK1, SOF_3D);
        SendToTarget(m_penPhase2Attack1, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
    case 1:
        StartModelAnim(MENTAL_ANIM_ATTACKDOWN, 0);
        PlaySound(m_soSound, SOUND_ATTACK2, SOF_3D);
        SendToTarget(m_penPhase2Attack2, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
    case 2:
        StartModelAnim(MENTAL_ANIM_ATTACKPOINT, 0);
        PlaySound(m_soSound, SOUND_ATTACK3, SOF_3D);
        SendToTarget(m_penPhase2Attack3, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
     }
    }

   if( GetHealth() <= m_fPhase3Health) {
    INDEX iRnd = IRnd()%3;
    switch(iRnd)
    {
    case 0:
        StartModelAnim(MENTAL_ANIM_ATTACKSWIPE, 0);
        PlaySound(m_soSound, SOUND_ATTACK1, SOF_3D);
        SendToTarget(m_penPhase3Attack1, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
    case 1:
        StartModelAnim(MENTAL_ANIM_ATTACKDOWN, 0);
        PlaySound(m_soSound, SOUND_ATTACK2, SOF_3D);
        SendToTarget(m_penPhase3Attack2, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
    case 2:
        StartModelAnim(MENTAL_ANIM_ATTACKPOINT, 0);
        PlaySound(m_soSound, SOUND_ATTACK3, SOF_3D);
        SendToTarget(m_penPhase3Attack3, EET_TRIGGER, FixupCausedToPlayer(this, m_penEnemy));
        break;
     }
    }
    autowait(2.0f);
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
    SetHealth(m_fPhase1Health);
    m_fMaxHealth = m_fPhase1Health;
    en_fDensity = 20000.0f;
    m_fBlowUpSize = 2.0f;
	m_EeftType=EFT_FLY_ONLY;

    // this one is boss!
    m_bBoss = TRUE;

    // set your appearance
    SetModel(MODEL_MENTAL);
    SetModelMainTexture(TEXTURE_MENTAL);
    AddAttachment(0, MODEL_HEAD, TEXTURE_HEAD);

    // setup moving speed
    m_fFlyWalkSpeed =0.0f;
    m_aFlyWalkRotateSpeed = FRnd()*100.0f + 600.0f;
    m_fFlyAttackRunSpeed = 0.0f;
    m_aFlyAttackRotateSpeed = FRnd()*100 + 600.0f;
    m_fFlyCloseRunSpeed = 0.0f;
    m_aFlyCloseRotateSpeed = FRnd()*100 + 600.0f;
    // setup attack distances
    m_fFlyAttackDistance = 50000.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 0.0f;
    m_fFlyAttackFireTime = m_fAttackFireTime;
    m_fCloseFireTime = 5.0f;
    m_fFlyIgnoreRange = 2000000.0f;
    // damage/explode properties
    m_fBlowUpAmount = 1e6;
    m_fBodyParts = 4;
    m_fDamageWounded = 10000.0f;
    m_iScore = 0;

    // set stretch factors for height and width
    const FLOAT fSize = 2.0f;
    GetModelObject()->StretchModel(FLOAT3D(fSize, fSize, fSize));
    ModelChangeNotify();
    StandingAnim();

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};
