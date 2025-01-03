320
%{
#include "StdH.h"
#include "ModelsF/t3dgm/Hivebrain/Hivebrain.h"
#include "EntitiesMP/Common/PathFinding.h"
#include "EntitiesMP/NavigationMarker.h"
%}

uses "EntitiesMP/EnemyFly";
uses "EntitiesMP/BasicEffects";

enum HiveBrainType {
  0 HB_SMALL         "Small",      // normal (fighter)
  1 HB_BIG            "Big",        // big
};

enum HivebrainTarget {
  0 HVT_NONE      "",   // no target
  1 HVT_ENEMY     "",   // follow enemy
};

%{
#define MF_MOVEZ    (1L<<0)

#define G_HOLE1      FLOAT3D(0.7f, 0.35f, -0.3f)
#define G_HOLE2      FLOAT3D(-0.7f, 0.35f, -0.3f)
#define G_HOLE3      FLOAT3D(-0.7f, 0.35f, 0.3f)
#define G_HOLE4      FLOAT3D(0.7f, 0.35f, 0.3f)
#define A_HOLE1      FLOAT3D(0.7f, -0.5f, -0.3f)
#define A_HOLE2      FLOAT3D(-0.7f, -0.5f, -0.3f)
#define A_HOLE3      FLOAT3D(-0.7f, -0.5f, 0.3f)
#define A_HOLE4      FLOAT3D(0.7f, -0.5f, 0.3f)
#define SMALL_STRETCH 2.0f
#define BIG_STRETCH 4.0f

// info structure
static EntityInfo eiHivebrainSmall = {
  EIBT_FLESH, 1600.0f,
  0.0f, 1.0f*SMALL_STRETCH, 0.0f,
  0.0f, 1.0f*SMALL_STRETCH, 0.0f,
};
static EntityInfo eiHivebrainBig = {
  EIBT_FLESH, 1600.0f,
  0.0f, 1.0f*BIG_STRETCH, 0.0f,
  0.0f, 1.0f*BIG_STRETCH, 0.0f,
};
%}


class CHiveBrain : CEnemyFly {
name      "HiveBrain";
thumbnail "Thumbnails\\HiveBrain.tbn";

properties:
  1 INDEX   m_fgibTexture = TEXTURE_SMALL,
  2 enum HiveBrainType m_hbType     "Character" 'C' = HB_SMALL,
  3 CEntityPointer m_penSpawn1  "Spawn Template" 'T',

 10 CEntityPointer m_penMarkerNew "1st Grid Marker",
 11 CEntityPointer m_penMarkerOld,
 18 enum HivebrainTarget m_hvtTarget = HVT_ENEMY, // type of target
 14 FLOAT m_fStopRadius  "Stop Range" = 15.0f,
 15 FLOAT m_fMeleeRadius "Melee Range" = 15.0f,
 16 FLOAT m_fAttackRadius "Attack Range" = 100.0f,
 17 FLOAT m_fAttackFreq   "Attack Frequency" = 5.0f,

components:
  0 class   CLASS_BASE        "Classes\\EnemyFly.ecl",
  1 model   MODEL_HIVEBRAIN   "ModelsF\\t3dgm\\HiveBrain\\HiveBrain.mdl",
  2 texture TEXTURE_SMALL     "ModelsF\\t3dgm\\HiveBrain\\ALIEN2.tex",
  3 texture TEXTURE_BIG     "ModelsF\\t3dgm\\HiveBrain\\ALIEN1.tex",
  4 class   CLASS_PROJECTILE  "Classes\\Projectile.ecl",
  5 class   CLASS_BASIC_EFFECT    "Classes\\BasicEffect.ecl",
// ************** FLESH PARTS **************
  6 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
  7 texture TEXTURE_FLESH_GREEN  "Models\\Effects\\Debris\\Flesh\\FleshGreen.tex",

  8 model   MODEL_DEBRIS_BODY           "ModelsF\\t3dgm\\HiveBrain\\Debris\\Body.mdl",
  9 model   MODEL_DEBRIS_LEG            "ModelsF\\t3dgm\\HiveBrain\\Debris\\Leg.mdl",
 10 model   MODEL_DEBRIS_TUBE           "ModelsF\\t3dgm\\HiveBrain\\Debris\\Tube.mdl",

 11 texture TEXTURE_SPECULAR  "Models\\SpecularTextures\\Strong.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "ModelsF\\t3dgm\\HiveBrain\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "ModelsF\\t3dgm\\HiveBrain\\Sounds\\Sight.wav",
 53 sound   SOUND_FIRE      "ModelsF\\t3dgm\\HiveBrain\\Sounds\\Fire.wav",
 54 sound   SOUND_MELEE     "ModelsF\\t3dgm\\HiveBrain\\Sounds\\Melee.wav",
 55 sound   SOUND_DEATH     "ModelsF\\t3dgm\\HiveBrain\\Sounds\\Death.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("%s got violated by a _"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmSmall, "DataF\\Messages\\Enemies\\HiveBrainSmall.txt");
    static DECLARE_CTFILENAME(fnmBig, "DataF\\Messages\\Enemies\\HiveBrainBig.txt");
    switch(m_hbType) {
    default: ASSERT(FALSE);
    case HB_SMALL: return fnmSmall;
    case HB_BIG: return fnmBig;
	}
  };

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
   {
    if( slPropertyOffset == offsetof(CHiveBrain, m_penMarkerNew))
    {
      if (IsOfClass(penTarget, "NavigationMarker")) { return TRUE; }
      else { return FALSE; }
    }   
    if (slPropertyOffset == offsetof(CHiveBrain, m_penSpawn1))
	 {
      return ValidEnemy(penTarget);
    } 
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }
  
  BOOL DoSafetyChecks(void) {
    if (m_penMarkerNew==NULL) {
      WarningMessage("First HiveBrain marker not set! Destroying entity...\n");
      return FALSE;
    }
    return TRUE;
  }

  BOOL ValidEnemy(CEntity *pen) {
    if (pen == NULL || pen == this || !IsDerivedFromClass(pen, "Enemy Base")) {
      return FALSE;
    }
    return ((CEnemyBase&)*pen).m_bTemplate;
  };

  BOOL IsOnMarker(CEntity *penMarker)  {
    
    if (penMarker==NULL) { return FALSE; }
    if (DistanceTo(this, penMarker)<0.1f) { return TRUE; }
    // else
    return FALSE;
  }

  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheModel(MODEL_HIVEBRAIN );
    PrecacheTexture(TEXTURE_SMALL);
    PrecacheTexture(TEXTURE_BIG);
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_FIRE );
    PrecacheSound(SOUND_MELEE );
    PrecacheSound(SOUND_DEATH);
    PrecacheClass(CLASS_PROJECTILE, PRT_LARVA_HIVEBRAIN);

    PrecacheModel(MODEL_DEBRIS_BODY);
    PrecacheModel(MODEL_DEBRIS_LEG);
    PrecacheModel(MODEL_DEBRIS_TUBE);
    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_GREEN);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_FLESH_SPLAT_FX);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_HIVEBRAIN);
  };

  ULONG SetDesiredMovement(void) 
  {
    ULONG ulFlags = 0;
    FLOAT3D vPos;
    CEntity *penMarker = m_penMarkerNew;
    CEntity *penTarget;

    if (m_hvtTarget==HVT_ENEMY && m_penEnemy) { penTarget = m_penEnemy; }
    else { return ulFlags; }

    // CPrintF("target = %s at %f\n", penTarget->GetName(), _pTimer->CurrentTick());

    if (IsOnMarker(m_penMarkerNew)) {
      PATH_FindNextMarker(penTarget, GetPlacement().pl_PositionVector,
        penTarget->GetPlacement().pl_PositionVector, penMarker, vPos);
      if (penMarker!=NULL) {
        // remember the old marker
        m_penMarkerOld = m_penMarkerNew;
        // and set the new target
        m_penMarkerNew = penMarker;
      }
      MoveToMarker(m_penMarkerNew);
      ulFlags |= MF_MOVEZ;
    } else {
      MoveToMarker(m_penMarkerNew);
      ulFlags |= MF_MOVEZ;
    }
   
    if (m_hvtTarget==HVT_ENEMY && DistanceTo(this, penTarget)<m_fStopRadius) {
      ForceFullStop();
    }
    
    return ulFlags;
  };

  void MoveToMarker(CEntity *penMarker) {
    if(penMarker==NULL) { return; }
    FLOAT3D vDesiredDir = penMarker->GetPlacement().pl_PositionVector -
                   GetPlacement().pl_PositionVector;
    if (vDesiredDir.Length()>0.0f) {
      vDesiredDir.Normalize();
      FLOAT3D vSpeed = vDesiredDir*m_fAttackRunSpeed;
      SetDesiredTranslation(vSpeed);
    }
  }

  // pre moving
  void PreMoving() {
      
      // rotate to enemy
      if (m_penEnemy!=NULL) {
        
        FLOAT3D vToEnemy;
        vToEnemy = (m_penEnemy->GetPlacement().pl_PositionVector - 
          GetPlacement().pl_PositionVector).Normalize();
        ANGLE3D aAngle;
        DirectionVectorToAngles(vToEnemy, aAngle);
        aAngle(1) = aAngle(1) - GetPlacement().pl_OrientationAngle(1);
        aAngle(1) = NormalizeAngle(aAngle(1));
        SetDesiredRotation(FLOAT3D(aAngle(1)*2.0f, 0.0f, 0.0f));         
      } else {
        SetDesiredRotation(FLOAT3D(0.0f, 0.0f, 0.0f));
      }
      
      // lower speed if needed, not to miss the marker
      if (en_vCurrentTranslationAbsolute.Length()*_pTimer->TickQuantum*2.0f >
        DistanceTo(this, m_penMarkerNew)) {
        FLOAT3D vToMarker = m_penMarkerNew->GetPlacement().pl_PositionVector -
          GetPlacement().pl_PositionVector;
        SetDesiredTranslation(vToMarker/_pTimer->TickQuantum) ;        
      }
        
      // stop when on marker
      if (IsOnMarker(m_penMarkerNew)) {
        ForceStopTranslation();
      }
    
    CEnemyBase::PreMoving();
  }

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_hbType==HB_SMALL) {
      return &eiHivebrainSmall;
    } else {
      return &eiHivebrainBig;
    }
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // woman can't harm woman
    if (!IsOfClass(penInflictor, "HiveBrain")) {
      CEnemyFly::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  // virtual anim functions
  void StandingAnim(void) {
      StartModelAnim(HIVEBRAIN_ANIM_AIRIDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void WalkingAnim(void) {
      StartModelAnim(HIVEBRAIN_ANIM_AIRIDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void RunningAnim(void) {
      StartModelAnim(HIVEBRAIN_ANIM_AIRIDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void RotatingAnim(void) {
      StartModelAnim(HIVEBRAIN_ANIM_AIRIDLE, AOF_LOOPING|AOF_NORESTART);
  };

  void ChangeCollisionToAir() {
    ChangeCollisionBoxIndexWhenPossible(HIVEBRAIN_COLLISION_BOX_AIR);
  };

  void ChangeCollisionToGround() {
    ChangeCollisionBoxIndexWhenPossible(HIVEBRAIN_COLLISION_BOX_GROUND);
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
    m_soSound.Set3DParameters(200.0f, 30.0f, 2.0f, 1.0f);
	}
  };


  void LaunchMonsterG1(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(G_HOLE1*SMALL_STRETCH, ANGLE3D(-45.0f, 0.0f, 0.0f));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -15.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonsterG2(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(G_HOLE2*BIG_STRETCH, ANGLE3D(45.0f, 0.0f, 0.0f));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -15.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonsterG3(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(G_HOLE3*BIG_STRETCH, ANGLE3D(135.0f, 0.0f, 0.0f));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -15.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonsterG4(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(G_HOLE4*BIG_STRETCH, ANGLE3D(-135.0f, 0.0f, 0.0f));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -15.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonsterA1(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(A_HOLE1*BIG_STRETCH, ANGLE3D(-45.0f, 0.0f, 0.0f));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -15.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonsterA2(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(A_HOLE2*BIG_STRETCH, ANGLE3D(45.0f, 0.0f, 0.0f));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -15.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonsterA3(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(A_HOLE3*BIG_STRETCH, ANGLE3D(135.0f, 0.0f, 0.0f));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -15.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
  };


  void LaunchMonsterA4(void)
  {

    CPlacement3D pl;
    // spawn placement
    pl = CPlacement3D(A_HOLE4*BIG_STRETCH, ANGLE3D(-135.0f, 0.0f, 0.0f));
    pl.RelativeToAbsolute(GetPlacement());

    CEntity *pen = GetWorld()->CopyEntityInWorld(*m_penSpawn1, pl);

    // change needed properties
    pen->End();
    CEnemyBase *peb = ((CEnemyBase*)pen);
    ((CEnemyBase&)*pen).m_penEnemy = m_penEnemy;
    ((CEnemyBase&)*pen).m_ttTarget = m_ttTarget;
    peb->m_bTemplate = FALSE;
    pen->Initialize();
    // set moving
    ((CEnemyBase&)*pen).LaunchAsFreeProjectile(FLOAT3D(0, 0, -15.0f), this);
    ((CEnemyBase&)*pen).SetDesiredRotation(ANGLE3D(0, 0, FRnd()*360-180));
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

    vNormalizedDamage *= 0.5f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;
      // spawn debris
      Debris_Begin(EIBT_FLESH, DPT_SLIMETRAIL, BET_GIZMOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 1.0f, 0.0f);
   
    Debris_Spawn(this, this, MODEL_DEBRIS_BODY, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_LEG, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_TUBE, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_TUBE, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_TUBE, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_DEBRIS_TUBE, m_fgibTexture, 0, 0, 0, IRnd()%4, 0.5f,
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

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_HIVEBRAIN;
      eSpawnEffect.vStretch = FLOAT3D(m_fBlowUpSize/2, m_fBlowUpSize/2, m_fBlowUpSize/2);
      penExplosion->Initialize(eSpawnEffect);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };

procedures:
/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/

  FlyFire(EVoid) : CEnemyFly::FlyFire {
    // fire projectile
    StartModelAnim(HIVEBRAIN_ANIM_AIRFIRE, 0);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.35f);
    if (m_hbType == HB_SMALL) {
     ShootProjectile(PRT_LARVA_HIVEBRAIN, A_HOLE1*SMALL_STRETCH, ANGLE3D(-45, 0, 0));
     autowait(0.1f);
     ShootProjectile(PRT_LARVA_HIVEBRAIN, A_HOLE2*SMALL_STRETCH, ANGLE3D(45, 0, 0));
     autowait(0.1f);
     ShootProjectile(PRT_LARVA_HIVEBRAIN, A_HOLE3*SMALL_STRETCH, ANGLE3D(135, 0, 0));
     autowait(0.1f);
     ShootProjectile(PRT_LARVA_HIVEBRAIN, A_HOLE4*SMALL_STRETCH, ANGLE3D(-135, 0, 0));
	 }
    if (m_hbType == HB_BIG) {
     LaunchMonsterA1();
     autowait(0.1f);
     LaunchMonsterA2();
     autowait(0.1f);
     LaunchMonsterA3();
     autowait(0.1f);
     LaunchMonsterA4();
	 }
    autowait(0.55f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);
    MaybeSwitchToAnotherPlayer();

    return EReturn();
  };

  GroundFire(EVoid) : CEnemyFly::GroundFire {
    // fire projectile
    StartModelAnim(HIVEBRAIN_ANIM_GROUNDFIRE, 0);
    PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
    autowait(0.35f);
    if (m_hbType == HB_SMALL) {
     ShootProjectile(PRT_LARVA_HIVEBRAIN, G_HOLE1*SMALL_STRETCH, ANGLE3D(-45, 0, 0));
     autowait(0.1f);
     ShootProjectile(PRT_LARVA_HIVEBRAIN, G_HOLE2*SMALL_STRETCH, ANGLE3D(45, 0, 0));
     autowait(0.1f);
     ShootProjectile(PRT_LARVA_HIVEBRAIN, G_HOLE3*SMALL_STRETCH, ANGLE3D(135, 0, 0));
     autowait(0.1f);
     ShootProjectile(PRT_LARVA_HIVEBRAIN, G_HOLE4*SMALL_STRETCH, ANGLE3D(-135, 0, 0));
	 }
    if (m_hbType == HB_BIG) {
     LaunchMonsterG1();
     autowait(0.1f);
     LaunchMonsterG2();
     autowait(0.1f);
     LaunchMonsterG3();
     autowait(0.1f);
     LaunchMonsterG4();
	 }
    autowait(0.55f);
    StandingAnim();
    autowait(FRnd()/2 + _pTimer->TickQuantum);
    MaybeSwitchToAnotherPlayer();

    return EReturn();
  };

  FlyHit(EVoid) : CEnemyFly::FlyHit {
    StartModelAnim(HIVEBRAIN_ANIM_AIRMELEE, 0);
    StopMoving();
    PlaySound(m_soSound, SOUND_MELEE, SOF_3D);
    // damage enemy
    autowait(0.45f);
    // damage enemy
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      if (m_hbType==HB_SMALL) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 40.0f, FLOAT3D(0, 0, 0), vDirection);
	  } else { 
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 80.0f, FLOAT3D(0, 0, 0), vDirection);
		}
    }
    autowait(0.65f);

    StandingAnim();
    return EReturn();
  };

  GroundHit(EVoid) : CEnemyFly::GroundHit {
    StartModelAnim(HIVEBRAIN_ANIM_GROUNDMELEE, 0);
    StopMoving();
    PlaySound(m_soSound, SOUND_MELEE, SOF_3D);
    // damage enemy
    autowait(0.45f);
    // damage enemy
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.SafeNormalize();
      if (m_hbType==HB_SMALL) {
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 40.0f, FLOAT3D(0, 0, 0), vDirection);
	  } else { 
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 80.0f, FLOAT3D(0, 0, 0), vDirection);
		}
    }
    autowait(0.65f);

    StandingAnim();
    return EReturn();
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
    en_fDensity = 2000.0f;
	m_EeftType=EFT_FLY_ONLY;
    m_sptType = SPT_SLIME;
    SetModel(MODEL_HIVEBRAIN);
    

    if (m_hbType == HB_SMALL) {
    // set your appearance
    SetModelSpecularTexture(TEXTURE_SPECULAR);
    SetModelMainTexture(TEXTURE_SMALL);
		m_fgibTexture = TEXTURE_SMALL;
    GetModelObject()->StretchModel(FLOAT3D(SMALL_STRETCH, SMALL_STRETCH, SMALL_STRETCH));
    SetHealth(500.0f);
    m_fMaxHealth = 500.0f;
    // setup moving speed
    m_fWalkSpeed = FRnd() + 1.2f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fAttackRunSpeed = FRnd()*2.0f + 7.5f;
    m_aAttackRotateSpeed = FRnd()*50 + 245.0f;
    m_fCloseRunSpeed = FRnd()*2.0f + 8.0f;
    m_aCloseRotateSpeed = FRnd()*50 + 245.0f;
    // setup attack distances
    m_fAttackDistance = m_fAttackRadius;
    m_fCloseDistance = m_fMeleeRadius;
    m_fStopDistance = m_fStopRadius;
    m_fAttackFireTime = m_fAttackFreq;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = m_fAttackRadius;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd()/2 + 0.5f;
    m_aFlyWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fFlyAttackRunSpeed = FRnd()*2.0f + 8.0f;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 150.0f;
    m_fFlyCloseRunSpeed = FRnd()*2.0f + 12.0f;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 500.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = m_fAttackRadius;
    m_fFlyCloseDistance = m_fMeleeRadius;
    m_fFlyStopDistance = m_fStopRadius;
    m_fFlyAttackFireTime = m_fAttackFreq;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = m_fAttackRadius;
    // damage/explode properties
    m_fBlowUpAmount = 0.0f;
    m_fBodyParts = 10;
	m_fBlowUpSize = 4.0f;
    m_fDamageWounded = 100000.0f;
    m_iScore = 5000;
	}
    if (m_hbType == HB_BIG) {
    // set your appearance
    SetModelSpecularTexture(TEXTURE_SPECULAR);
    SetModelMainTexture(TEXTURE_BIG);
		m_fgibTexture = TEXTURE_BIG;
    GetModelObject()->StretchModel(FLOAT3D(BIG_STRETCH, BIG_STRETCH, BIG_STRETCH));
    SetHealth(1000.0f);
    m_fMaxHealth = 1000.0f;
    // setup moving speed
    m_fWalkSpeed = FRnd() + 2.4f;
    m_aWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fAttackRunSpeed = FRnd()*4.0f + 7.5f;
    m_aAttackRotateSpeed = FRnd()*50 + 245.0f;
    m_fCloseRunSpeed = FRnd()*4.0f + 8.0f;
    m_aCloseRotateSpeed = FRnd()*50 + 245.0f;
    // setup attack distances
    m_fAttackDistance = m_fAttackRadius;
    m_fCloseDistance = m_fMeleeRadius;
    m_fStopDistance = m_fStopRadius;
    m_fAttackFireTime = m_fAttackFreq;
    m_fCloseFireTime = 2.0f;
    m_fIgnoreRange = m_fAttackRadius;
    // fly moving properties
    m_fFlyWalkSpeed = FRnd()/4 + 0.5f;
    m_aFlyWalkRotateSpeed = FRnd()*10.0f + 25.0f;
    m_fFlyAttackRunSpeed = FRnd()*4.0f + 8.0f;
    m_aFlyAttackRotateSpeed = FRnd()*25 + 150.0f;
    m_fFlyCloseRunSpeed = FRnd()*4.0f + 12.0f;
    m_aFlyCloseRotateSpeed = FRnd()*50 + 500.0f;
    // attack properties - CAN BE SET
    m_fFlyAttackDistance = m_fAttackRadius;
    m_fFlyCloseDistance = m_fMeleeRadius;
    m_fFlyStopDistance = m_fStopRadius;
    m_fFlyAttackFireTime = m_fAttackFreq;
    m_fFlyCloseFireTime = 2.0f;
    m_fFlyIgnoreRange = m_fAttackRadius;
    // damage/explode properties
    m_fBlowUpAmount = 0.0f;
    m_fBodyParts = 20;
	m_fBlowUpSize = 8.0f;
    m_fDamageWounded = 100000.0f;
    m_iScore = 20000;
	}

    ModelChangeNotify();
    StandingAnim();

    autowait(0.05f);

    if (!DoSafetyChecks()) {
      Destroy();
      return;
    }

    // continue behavior in base class
    jump CEnemyFly::MainLoop();
  };
};
