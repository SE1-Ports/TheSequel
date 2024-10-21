336

%{
#include "StdH.h"
#include "ModelsF/t3dgm/Cyclops/Cyclop.h"
#include "ModelsF/t3dgm/Cyclops/Head.h"
#include "ModelsF/t3dgm/Cyclops/Arm.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/CyclopsProjectile";

enum CycType {
  0 CYC_GREEN         "Arm launcher",
  1 CYC_BLUE          "Head tosser",
};

%{
// info structure
static EntityInfo eiCyclops = {
  EIBT_FLESH, 1500.0f,
  0.0f, 2.0f, 0.0f,     // source (eyes)
  0.0f, 1.5f, 0.0f,     // target (body)
};
#define LAUNCH_ARM   FLOAT3D(0.75f, 4.0f, 0.0f)
#define LAUNCH_HEAD  FLOAT3D(0.0f, 5.0f, 0.0f)
%}

class CCyclops : CEnemyBase {
name      "Cyclops";
thumbnail "Thumbnails\\Cyclops.tbn";

properties:
  1 enum CycType m_cycType     "Character" 'C' = CYC_GREEN,
  2 INDEX m_iCounter = 0,
  3 BOOL m_bBeBoss  "Boss" 'B' = FALSE,
  6 INDEX   m_fgibTexture = TEXTURE_CYCLOPS_GREEN,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",
  3 class   CLASS_CYCLOPS_PROJECTILE  "Classes\\CyclopsProjectile.ecl",

 10 model   MODEL_CYCLOPS           "ModelsF\\t3dgm\\Cyclops\\Cyclop.mdl",
 11 texture TEXTURE_CYCLOPS_GREEN  "ModelsF\\t3dgm\\Cyclops\\cyclop03.tex",
 12 texture TEXTURE_CYCLOPS_BLUE     "ModelsF\\t3dgm\\Cyclops\\cyclop01.tex",

 20 model   MODEL_DEBRIS_ARM           "ModelsF\\t3dgm\\Cyclops\\Debris\\Arm.mdl",
 21 model   MODEL_DEBRIS_CHEST           "ModelsF\\t3dgm\\Cyclops\\Debris\\Chest.mdl",
 22 model   MODEL_DEBRIS_HED         "ModelsF\\t3dgm\\Cyclops\\Debris\\Hed.mdl",
 23 model   MODEL_DEBRIS_LEG         "ModelsF\\t3dgm\\Cyclops\\Debris\\Leg.mdl",
 27 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 28 texture TEXTURE_FLESH_RED  "Models\\Effects\\Debris\\Flesh\\FleshRed.tex",

 30 model   MODEL_PROJECTILE_HEAD         "ModelsF\\t3dgm\\Cyclops\\Head.mdl",
 31 model   MODEL_PROJECTILE_ARM          "ModelsF\\t3dgm\\Cyclops\\Arm.mdl",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\t3dgm\\Cyclops\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\t3dgm\\Cyclops\\Sounds\\Sight.wav",
 52 sound   SOUND_FIREHEAD  "ModelsF\\t3dgm\\Cyclops\\Sounds\\FireHead.wav",
 53 sound   SOUND_FIREARM   "ModelsF\\t3dgm\\Cyclops\\Sounds\\FireArm.wav",
 54 sound   SOUND_KICK      "ModelsF\\t3dgm\\Cyclops\\Sounds\\Melee.wav",
 55 sound   SOUND_DEATH     "ModelsF\\t3dgm\\Cyclops\\Sounds\\Death.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A monster killed %s"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmGreen, "DataF\\Messages\\Enemies\\CyclopsGreen.txt");
    static DECLARE_CTFILENAME(fnmBle, "DataF\\Messages\\Enemies\\CyclopsBlue.txt");
    switch(m_cycType) {
    default: ASSERT(FALSE);
    case CYC_GREEN: return fnmGreen;
    case CYC_BLUE: return fnmBle;
    }
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_FIREARM);
    PrecacheSound(SOUND_FIREHEAD);
    PrecacheSound(SOUND_KICK);
    PrecacheSound(SOUND_DEATH);
    PrecacheModel(MODEL_CYCLOPS);
    PrecacheTexture(TEXTURE_CYCLOPS_GREEN);
    PrecacheTexture(TEXTURE_CYCLOPS_BLUE);
	  PrecacheModel(MODEL_DEBRIS_ARM);
	  PrecacheModel(MODEL_DEBRIS_CHEST);
	  PrecacheModel(MODEL_DEBRIS_HED);
	  PrecacheModel(MODEL_DEBRIS_LEG);
    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_RED);
	PrecacheClass(CLASS_CYCLOPS_PROJECTILE);
    PrecacheModel(MODEL_PROJECTILE_HEAD);
    PrecacheModel(MODEL_PROJECTILE_ARM);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
      return &eiCyclops;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {


    // can't harm own class
    if (!IsOfClass(penInflictor, "Cyclops")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    iAnim = CYCLOP_ANIM_DEATH;
    StartModelAnim(iAnim, 0);
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==CYCLOP_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(CYCLOP_COLLISION_BOX_PART_NAME);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    StartModelAnim(CYCLOP_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
    StartModelAnim(CYCLOP_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
  };

  void RunningAnim(void) {
    WalkingAnim();
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
  void DeathSound(void) {
    PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
  };

  // fire body parts
  void FireArm(void) 
  {
    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())), INDEX(0), INDEX(10));
    // disable too much spawning
    if (GetHealth()<=0.0f)
    {
      ctShouldSpawn+=1;
    }

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(LAUNCH_ARM, ANGLE3D(0, 0, 0));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = NULL;

    // create entity
    pen = CreateEntity(pl, CLASS_CYCLOPS_PROJECTILE);
    ((CCyclopsProjectile&)*pen).m_CypChar = CYP_A;
    // start properties
    ((CCyclopsProjectile&)*pen).m_colColor = m_colColor;
    ((CCyclopsProjectile&)*pen).m_penEnemy = m_penEnemy;
    ((CCyclopsProjectile&)*pen).m_ttTarget = m_ttTarget;
    ((CCyclopsProjectile&)*pen).m_bSpawned = TRUE;
    pen->Initialize(EVoid());
    // set moving
    ((CCyclopsProjectile&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -50.0f), this);
    ((CCyclopsProjectile&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };

  void FireHead(void) 
  {
    INDEX ctShouldSpawn = Clamp( INDEX((m_fMaxHealth-GetHealth())), INDEX(0), INDEX(10));
    // disable too much spawning
    if (GetHealth()<=0.0f)
    {
      ctShouldSpawn+=1;
    }

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(LAUNCH_HEAD, ANGLE3D(0, 0, 0));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = NULL;

    // create entity
    pen = CreateEntity(pl, CLASS_CYCLOPS_PROJECTILE);
    ((CCyclopsProjectile&)*pen).m_CypChar = CYP_H;
    // start properties
    ((CCyclopsProjectile&)*pen).m_colColor = m_colColor;
    ((CCyclopsProjectile&)*pen).m_penEnemy = m_penEnemy;
    ((CCyclopsProjectile&)*pen).m_ttTarget = m_ttTarget;
    ((CCyclopsProjectile&)*pen).m_bSpawned = TRUE;
    pen->Initialize(EVoid());
    // set moving
    ((CCyclopsProjectile&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 20, 0.0f), this);
    ((CCyclopsProjectile&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    if (m_bQuiet) {
    m_soSound.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
	} else {
    m_soSound.Set3DParameters(120.0f, 20.0f, 1.0f, 1.0f);
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
	Debris_Begin(EIBT_FLESH, DPT_BLOODTRAIL, BET_BLOODSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 2.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_DEBRIS_CHEST, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_ARM, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_DEBRIS_HED, m_fgibTexture, 0, 0, 0, 0, 0.5f,
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
  Fire(EVoid) : CEnemyBase::Fire
  {  
    // to fire
    if( m_cycType == CYC_GREEN)
    {
      PlaySound(m_soSound, SOUND_FIREARM, SOF_3D);
      StartModelAnim(CYCLOP_ANIM_FIREARM, 0); 
      autowait(0.65f);

      FireArm();

      autowait(1.0f);
    }
    if( m_cycType == CYC_BLUE)
    {
      PlaySound(m_soSound, SOUND_FIREHEAD, SOF_3D);
      StartModelAnim(CYCLOP_ANIM_FIREHEAD, 0);
      autowait(0.8f);

      FireHead();

      autowait(1.0f);
    }

    MaybeSwitchToAnotherPlayer();   

    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    // close attack
    StartModelAnim(CYCLOP_ANIM_MELEE, 0);
    PlaySound(m_soSound, SOUND_KICK, SOF_3D);
    autowait(0.425f);
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 30.0f, FLOAT3D(0, 0, 0), vDirection);
      // push target
      FLOAT3D vSpeed;
      GetHeadingDirection(AngleDeg(0.0f), vSpeed);
      vSpeed = vSpeed * 20.0f;
      KickEntity(m_penEnemy, vSpeed);
    }
    autowait(0.65f);
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
    en_tmMaxHoldBreath = 60.0f;

    en_fDensity = 1100.0f;
    SetHealth(350.0f);
    m_fBlowUpAmount = 700.0f;
	m_fBlowUpSize = 2.0f;
    m_fBodyParts = 6;
    m_fDamageWounded = 1500.0f;
    m_iScore = 4000;//500
    // set your appearance
    SetModel(MODEL_CYCLOPS);
    if (m_cycType == CYC_GREEN) {
      SetModelMainTexture(TEXTURE_CYCLOPS_GREEN);
		m_fgibTexture = TEXTURE_CYCLOPS_GREEN; }
    if (m_cycType == CYC_BLUE) {
      SetModelMainTexture(TEXTURE_CYCLOPS_BLUE);
		m_fgibTexture = TEXTURE_CYCLOPS_BLUE; }
    GetModelObject()->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    ModelChangeNotify();
    StandingAnim();
    // setup moving speed
    m_fAttackRunSpeed = 6.0f;//6
    m_aAttackRotateSpeed = AngleDeg(3600.0f);
    m_fWalkSpeed = FRnd()*2 + 7.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 900.0f);
    m_fCloseRunSpeed = FRnd() + 10.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 600.0f;
    m_fAttackFireTime = 5.0f;
    m_fCloseDistance = 3.0f;
    m_fStopDistance = 3.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_bBoss = m_bBeBoss;
    m_fStopDistance = 5.0f;
    m_fCloseDistance = 7.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);
    
    m_fMaxHealth = GetHealth();

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
