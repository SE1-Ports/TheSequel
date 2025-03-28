336

%{
#include "StdH.h"
#include "Models/Enemies/Beast/Beast.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";

enum BeastType {
  0 BT_NORMAL         "Small",      // normal (fighter)
  1 BT_BIG            "Big",        // big
  2 BT_HUGE           "Huge",       // huge
  3 BT_E              "Electric",
  4 BT_SB             "Small-Big",
};

enum BeastVer {
  0 BTV_FE            "First Encounter",
  1 BTV_SE            "Second Encounter",
  2 BTV_MIX           "Both",
};

%{
static _tmLastStandingAnim =0.0f;  
#define BEAST_STRETCH 2.0f
#define BIG_BEAST_STRETCH 12.0f
#define HUGE_BEAST_STRETCH 30.0f

#define BEASTSOUND(soundname) ((m_bcType==BT_BIG || m_bcType==BT_HUGE)? (SOUND_BIG_##soundname) : (SOUND_##soundname))

// info structure
static EntityInfo eiBeastENormal = {
  EIBT_FLESH, 1500.0f,
  0.0f, 2.0f*BEAST_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*BEAST_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiBeastBig = {
  EIBT_FLESH, 5000.0f,
  0.0f, 2.0f*BIG_BEAST_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*BIG_BEAST_STRETCH, 0.0f,     // target (body)
};
static EntityInfo eiBeastHuge = {
  EIBT_FLESH, 10000.0f,
  0.0f, 2.0f*HUGE_BEAST_STRETCH, 0.0f,     // source (eyes)
  0.0f, 1.5f*HUGE_BEAST_STRETCH, 0.0f,     // target (body)
};
%}

class CBeast : CEnemyBase {
name      "Beast";
thumbnail "Thumbnails\\Beast.tbn";

properties:
  1 enum BeastType m_bcType     "Character" 'C' = BT_NORMAL,
  2 INDEX m_iCounter = 0,

  4 enum BeastVer m_bcVer     "Version" 'V' = BTV_FE,
  6 INDEX   m_fgibTexture = TEXTURE_BEAST_NORMAL,
  7 CSoundObject m_soWoosh,
  8 CSoundObject m_soFeet,
  9 BOOL m_bRunSoundPlaying = FALSE,

components:
  0 class   CLASS_BASE          "Classes\\EnemyBase.ecl",
  1 class   CLASS_PROJECTILE    "Classes\\Projectile.ecl",
  2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

 10 model   MODEL_BEAST           "Models\\Enemies\\Beast\\Beast.mdl",
 11 texture TEXTURE_BEAST_NORMAL  "Models\\Enemies\\Beast\\Beast.tex",
 12 texture TEXTURE_BEAST_BIG     "Models\\Enemies\\Beast\\BeastBig.tex",
 13 texture TEXTURE_BEAST_HUGE    "ModelsMP\\Enemies\\Beast\\BeastBiggest.tex",
 14 texture TEXTURE_BEAST_ELECTRIC  "AREP\\Models\\BeastElectric\\BeastElectric.tex",

 15 model   MODEL_PLASMAGUN           "ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.mdl",
 16 texture TEXTURE_PLASMAGUN         "ModelsMP\\Enemies\\ExotechLarva\\Weapons\\PlasmaGun.tex",
 17 model   MODEL_LARVA_PLASMA        "ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.mdl",
 18 texture TEXTURE_LARVA_PLASMA      "ModelsMP\\Enemies\\ExotechLarva\\Projectile\\Projectile.tex",

 20 model   MODEL_BEAST_ARM           "ModelsF\\Enemies\\Beast\\Debris\\arm.mdl",
 21 model   MODEL_BEAST_LEGS           "ModelsF\\Enemies\\Beast\\Debris\\legs.mdl",
 22 model   MODEL_BEAST_TORSO         "ModelsF\\Enemies\\Beast\\Debris\\torso.mdl",
 27 model   MODEL_FLESH          "Models\\Effects\\Debris\\Flesh\\Flesh.mdl",
 28 texture TEXTURE_FLESH_GREEN  "Models\\Effects\\Debris\\Flesh\\FleshGreen.tex",

// ************** SOUNDS **************
 50 sound   SOUND_IDLE      "Models\\Enemies\\Beast\\Sounds\\Idle.wav",
 51 sound   SOUND_SIGHT     "Models\\Enemies\\Beast\\Sounds\\Sight.wav",
 52 sound   SOUND_WOUND     "Models\\Enemies\\Beast\\Sounds\\Wound.wav",
 53 sound   SOUND_FIRE      "Models\\Enemies\\Beast\\Sounds\\Fire.wav",
 54 sound   SOUND_KICK      "Models\\Enemies\\Beast\\Sounds\\Kick.wav",
 55 sound   SOUND_DEATH     "Models\\Enemies\\Beast\\Sounds\\Death.wav",
 56 sound   SOUND_DEATHBIG  "Models\\Enemies\\Beast\\Sounds\\DeathBig.wav",
 57 sound   SOUND_ANGER     "Models\\Enemies\\Beast\\Sounds\\Anger.wav",

 58 sound   SOUND_ROCKET    "Sounds\\Weapons\\RocketFly.wav",
 59 sound   SOUND_WOOSH      "ModelsMP\\Enemies\\SS2\\ScorpSoldier\\Sounds\\Melee.wav",
 60 sound   SOUND_KICKBIG      "ModelsF\\Enemies\\Beast\\BigSounds\\Kick.wav",
 
 61 sound   SOUND_BIG_IDLE      "ModelsF\\Enemies\\Beast\\BigSounds\\Idle.wav",
 62 sound   SOUND_BIG_SIGHT     "ModelsF\\Enemies\\Beast\\BigSounds\\Sight.wav",
 63 sound   SOUND_BIG_WOUND     "ModelsF\\Enemies\\Beast\\BigSounds\\Wound.wav",
 64 sound   SOUND_BIG_FIRE      "ModelsF\\Enemies\\Beast\\BigSounds\\Fire.wav",
 66 sound   SOUND_BIG_DEATHBIG     "ModelsF\\Enemies\\Beast\\BigSounds\\Death.wav",
 68 sound   SOUND_BIG_ANGER     "ModelsF\\Enemies\\Beast\\BigSounds\\Anger.wav",
 69 sound   SOUND_BIG_WALK      "ModelsF\\Enemies\\Beast\\BigSounds\\Walk.wav",

functions:
  // describe how this enemy killed player
  virtual CTString GetPlayerKillDescription(const CTString &strPlayerName, const EDeath &eDeath)
  {
    CTString str;
    str.PrintF(TRANS("A Reptiloid killed %s"), strPlayerName);
    return str;
  }
  virtual const CTFileName &GetComputerMessageName(void) const {
    static DECLARE_CTFILENAME(fnmNormal, "Data\\Messages\\Enemies\\BeastNormal.txt");
    static DECLARE_CTFILENAME(fnmBig, "Data\\Messages\\Enemies\\BeastBig.txt");
    static DECLARE_CTFILENAME(fnmHuge, "DataMP\\Messages\\Enemies\\BeastBiggest.txt");
    static DECLARE_CTFILENAME(fnmElectric, "DataMP\\Messages\\Enemies\\AREP\\BeastElectricFinal.txt");
    switch(m_bcType) {
    default: ASSERT(FALSE);
    case BT_NORMAL: return fnmNormal;
    case BT_SB: return fnmNormal;
    case BT_BIG: return fnmBig;
    case BT_HUGE: return fnmHuge;
    case BT_E: return fnmElectric;
    }
  };
  void Precache(void) {
    CEnemyBase::Precache();
    PrecacheSound(SOUND_IDLE );
    PrecacheSound(SOUND_SIGHT);
    PrecacheSound(SOUND_WOUND);
    PrecacheSound(SOUND_ANGER);
    PrecacheSound(SOUND_FIRE);
    PrecacheSound(SOUND_KICK);
    PrecacheSound(SOUND_KICKBIG);
    PrecacheSound(SOUND_DEATH);
    PrecacheSound(SOUND_DEATHBIG);
    PrecacheModel(MODEL_BEAST);
    PrecacheTexture(TEXTURE_BEAST_NORMAL);
    PrecacheTexture(TEXTURE_BEAST_BIG);
    PrecacheTexture(TEXTURE_BEAST_ELECTRIC);
	  PrecacheModel(MODEL_BEAST_ARM);
	  PrecacheModel(MODEL_BEAST_LEGS);
	  PrecacheModel(MODEL_BEAST_TORSO);
    PrecacheModel(MODEL_FLESH);
    PrecacheTexture(TEXTURE_FLESH_GREEN);
    if (m_bcType == BT_NORMAL) {
      PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_PROJECTILE); }
    if (m_bcType == BT_SB) {
      PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_PROJECTILE);}
    if (m_bcType == BT_E) {
      PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_E_PROJECTILE);
    } else {
      PrecacheClass(CLASS_PROJECTILE, PRT_BEAST_BIG_PROJECTILE);
      PrecacheClass(CLASS_PROJECTILE, PRT_DEVIL_GUIDED_PROJECTILE);
    }
	PrecacheModel(MODEL_PLASMAGUN);
	PrecacheTexture(TEXTURE_PLASMAGUN);
	PrecacheModel(MODEL_LARVA_PLASMA);
	PrecacheTexture(TEXTURE_LARVA_PLASMA);
	PrecacheSound(SOUND_ROCKET);
	PrecacheSound(SOUND_WOOSH);
	PrecacheSound(SOUND_BIG_WALK);
	
    PrecacheSound(SOUND_BIG_IDLE );
    PrecacheSound(SOUND_BIG_SIGHT);
    PrecacheSound(SOUND_BIG_WOUND);
    PrecacheSound(SOUND_BIG_ANGER);
    PrecacheSound(SOUND_BIG_FIRE);
    PrecacheSound(SOUND_BIG_DEATHBIG);
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    if (m_bcType == BT_E) {
      return &eiBeastENormal;
    } if (m_bcType == BT_NORMAL) {
      return &eiBeastENormal;
    } if (m_bcType == BT_HUGE) {
      return &eiBeastHuge;
    } if (m_bcType == BT_BIG) {
      return &eiBeastBig;
    } if (m_bcType == BT_SB) {
      return &eiBeastENormal;
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
    if (m_bcType == BT_BIG) {
      return 100.0f;
    } else if (m_bcType == BT_HUGE) {
      return 200.0f;
    }
    return 0.0f;
  }

  BOOL ForcesCannonballToExplode(void)
  {
    if (m_bcVer == BTV_FE || m_bcVer == BTV_MIX) {
      return FALSE;
	  }
    if (m_bcVer == BTV_SE) {
      return TRUE;
	  }
  }

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {

    // cannonballs inflict less damage then the default
    if (m_bcVer == BTV_FE || m_bcVer == BTV_MIX) {
      if(m_bcType==BT_BIG && dmtType==DMT_CANNONBALL)
      {
        fDamageAmmount *= 1.0f;
		}
    }
    if (m_bcVer == BTV_SE) {
      if(m_bcType==BT_BIG && dmtType==DMT_CANNONBALL)
      {
        fDamageAmmount *= 0.3333f;
		}
    }


    // can't harm own class
    if (!IsOfClass(penInflictor, "Beast")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };


  // damage anim
  INDEX AnimForDamage(FLOAT fDamage) {
    INDEX iAnim;
    if((m_bcType==BT_BIG || m_bcType==BT_HUGE || m_bcType==BT_SB) && GetHealth() <= m_fMaxHealth/2) {
      iAnim = BEAST_ANIM_ANGER;
    } else {
      iAnim = BEAST_ANIM_WOUND;
    }
    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  // death
  INDEX AnimForDeath(void) {
    INDEX iAnim;
    if(m_bcType==BT_BIG || m_bcType==BT_HUGE || m_bcType==BT_SB) {
      iAnim = BEAST_ANIM_DEATHBIG;
    } else {
      iAnim = BEAST_ANIM_DEATH;
    }

    StartModelAnim(iAnim, 0);
    DeactivateRunningSound();
    return iAnim;
  };

  FLOAT WaitForDust(FLOAT3D &vStretch) {
    if(GetModelObject()->GetAnim()==BEAST_ANIM_DEATH)
    {
      vStretch=FLOAT3D(1,1,2)*2.0f;
      return 0.3f;
    }
    return -1.0f;
  };

  void DeathNotify(void) {
    ChangeCollisionBoxIndexWhenPossible(BEAST_COLLISION_BOX_DEATH);
    en_fDensity = 500.0f;
  };

  // virtual anim functions
  void StandingAnim(void) {
    _tmLastStandingAnim = _pTimer->CurrentTick();
    StartModelAnim(BEAST_ANIM_IDLE, AOF_LOOPING|AOF_NORESTART);
    DeactivateRunningSound();
  };

  void WalkingAnim(void) {
    if(_pTimer->CurrentTick()>=_tmLastStandingAnim-_pTimer->TickQuantum &&
       _pTimer->CurrentTick()<=_tmLastStandingAnim+_pTimer->TickQuantum)
    {
      BREAKPOINT;
    }

    if(m_bcType==BT_BIG || m_bcType==BT_HUGE) {
      StartModelAnim(BEAST_ANIM_WALKBIG, AOF_LOOPING|AOF_NORESTART);
      ActivateRunningSound();
    } else {
      StartModelAnim(BEAST_ANIM_WALK, AOF_LOOPING|AOF_NORESTART);
      DeactivateRunningSound();
    }
  };

  void RunningAnim(void) {
    WalkingAnim();
  };
  void RotatingAnim(void) {
    WalkingAnim();
  };

  // virtual sound functions
  void IdleSound(void) {
    PlaySound(m_soSound, BEASTSOUND(IDLE), SOF_3D);
  };
  void SightSound(void) {
    PlaySound(m_soSound, BEASTSOUND(SIGHT), SOF_3D);
  };
  void TauntSound(void) {
    PlaySound(m_soSound, BEASTSOUND(ANGER), SOF_3D);
  };
  void WoundSound(void) {
    if((m_bcType==BT_BIG || m_bcType==BT_HUGE || m_bcType==BT_SB) && GetHealth() <= m_fMaxHealth/2) {
      PlaySound(m_soSound, BEASTSOUND(ANGER), SOF_3D);
    } else {
      PlaySound(m_soSound, BEASTSOUND(WOUND), SOF_3D);
    }
   };
  void DeathSound(void) {
    if(m_bcType==BT_BIG || m_bcType==BT_HUGE || m_bcType==BT_SB)  {
      PlaySound(m_soSound, BEASTSOUND(DEATHBIG), SOF_3D); 
	  } else {
      PlaySound(m_soSound, SOUND_DEATH, SOF_3D);
    }
  };


  // adjust sound and watcher parameters here if needed
  void EnemyPostInit(void) 
  {
    if (m_bQuiet) {
     m_soSound.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f); 
     m_soWoosh.Set3DParameters(0.0f, 0.0f, 1.0f, 0.75f);
     m_soFeet.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f); }
    else {
      if(m_bcType==BT_BIG || m_bcType==BT_HUGE) {
    m_soSound.Set3DParameters(500.0f, 100.0f, 3.0f, 1.0f); 
    m_soWoosh.Set3DParameters(50.0f, 20.0f, 1.0f, 0.75f);
    m_soFeet.Set3DParameters(300.0f, 50.0f, 1.0f, 1.0f); }
	  else {
    m_soSound.Set3DParameters(160.0f, 50.0f, 2.0f, 1.0f); 
    m_soWoosh.Set3DParameters(20.0f, 5.0f, 1.0f, 1.0f);
    m_soFeet.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f); }
	}
  };


  // running sounds
  void ActivateRunningSound(void)
  {
    if (!m_bRunSoundPlaying) {
      PlaySound(m_soFeet, SOUND_BIG_WALK, SOF_3D|SOF_LOOP);
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

    vNormalizedDamage *= 0.75f;

    FLOAT3D vBodySpeed = en_vCurrentTranslationAbsolute-en_vGravityDir*(en_vGravityDir%en_vCurrentTranslationAbsolute);

	
      ULONG ulFleshTexture = TEXTURE_FLESH_GREEN;
      ULONG ulFleshModel   = MODEL_FLESH;
    // spawn debris
	Debris_Begin(EIBT_FLESH, DPT_SLIMETRAIL, BET_GIZMOSTAIN, m_fBlowUpSize, vNormalizedDamage, vBodySpeed, 2.0f, 2.0f);

    Debris_Spawn(this, this, MODEL_BEAST_TORSO, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_BEAST_ARM, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_BEAST_ARM, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
    Debris_Spawn(this, this, MODEL_BEAST_LEGS, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_BEAST_ARM, m_fgibTexture, 0, 0, 0, 0, 0.5f,
      FLOAT3D(FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f, FRnd()*0.6f+0.2f));
	Debris_Spawn(this, this, MODEL_BEAST_ARM, m_fgibTexture, 0, 0, 0, 0, 0.5f,
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
 *                    D  E  A  T  H                         *
 ************************************************************/
  Death(EVoid) : CEnemyBase::Death {
    if ((m_bcType == BT_NORMAL || m_bcType == BT_E || m_bcType == BT_SB)) {
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
    if (m_bcType == BT_BIG || m_bcType==BT_HUGE) {
      ShakeItBaby(_pTimer->CurrentTick(), 2.0f);
    } else {
      ShakeItBaby(_pTimer->CurrentTick(), 3.0f);
    }
    autowait(2.3f-0.9f);
    if (m_bcType == BT_BIG || m_bcType==BT_HUGE) {
      ShakeItBaby(_pTimer->CurrentTick(), 5.0f);
    } else {
      ShakeItBaby(_pTimer->CurrentTick(), 7.0f);
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

    autowait(GetModelObject()->GetAnimLength(BEAST_ANIM_DEATHBIG)-2.3f);
    return EEnd();
  };

/************************************************************
 *                A T T A C K   E N E M Y                   *
 ************************************************************/
  Fire(EVoid) : CEnemyBase::Fire
  {
    DeactivateRunningSound();
    // wait to finish walk and smooth change to idle
    StartModelAnim(BEAST_ANIM_WALKTOIDLE, AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

    if( m_bcType == BT_NORMAL)
    {
      StartModelAnim(BEAST_ANIM_ATTACK, AOF_SMOOTHCHANGE);
      autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
      PlaySound(m_soSound, BEASTSOUND(FIRE), SOF_3D);
      autowait(0.51f);

      ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BEAST_STRETCH, 0.0f),
        ANGLE3D(AngleDeg((FRnd()-0.5)*30.0f), AngleDeg(FRnd()*10.0f), 0));
      autowait(0.3f);
    }
    
    if(m_bcType == BT_BIG)
    {
      if( GetHealth() <= m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<6)
        {
          StartModelAnim(BEAST_ANIM_ATTACKFAST, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, BEASTSOUND(FIRE), SOF_3D);
          autowait(0.34f);
          if (m_bcVer == BTV_FE) {
            ShootProjectile(PRT_DEVIL_GUIDED_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BIG_BEAST_STRETCH, 0.0f),
			ANGLE3D(AngleDeg((FRnd()-0.5)*30.0f), AngleDeg(FRnd()*10.0f), 0));
			}
          if (m_bcVer == BTV_SE) {
            ShootProjectile(PRT_BEAST_BIG_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BIG_BEAST_STRETCH, 0.0f),
            ANGLE3D(0.0f, 0.0f, 0.0f));
			}
          if (m_bcVer == BTV_MIX) {
            ShootProjectile(PRT_BEAST_BIG_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BIG_BEAST_STRETCH, 0.0f),
            ANGLE3D(0.0f, 0.0f, 0.0f));
			}
          m_iCounter++;
        }
        m_fAttackFireTime = 7.0f;
      }
      
      if( GetHealth() > m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<3)
        {
          StartModelAnim(BEAST_ANIM_ATTACK, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, BEASTSOUND(FIRE), SOF_3D);
          autowait(0.5f);
          if (m_bcVer == BTV_FE) {
            ShootProjectile(PRT_DEVIL_GUIDED_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BIG_BEAST_STRETCH, 0.0f),
			ANGLE3D(AngleDeg((FRnd()-0.5)*30.0f), AngleDeg(FRnd()*10.0f), 0));
			}
          if (m_bcVer == BTV_SE) {
            ShootProjectile(PRT_BEAST_BIG_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BIG_BEAST_STRETCH, 0.0f),
            ANGLE3D(0.0f, 0.0f, 0.0f));
			}
          if (m_bcVer == BTV_MIX) {
            ShootProjectile(PRT_BEAST_BIG_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BIG_BEAST_STRETCH, 0.0f),
            ANGLE3D(0.0f, 0.0f, 0.0f));
			}
          m_iCounter++;
        }
      }
    }

    if(m_bcType == BT_HUGE)
    {
      if( GetHealth() <= m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<6)
        {
          StartModelAnim(BEAST_ANIM_ATTACKFAST, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, BEASTSOUND(FIRE), SOF_3D);
          autowait(0.34f);
          if (m_bcVer == BTV_FE) {
            ShootProjectile(PRT_DEVIL_GUIDED_PROJECTILE, FLOAT3D( 0.0f, 1.5f*HUGE_BEAST_STRETCH, 0.0f),
			ANGLE3D(AngleDeg((FRnd()-0.5)*30.0f), AngleDeg(FRnd()*10.0f), 0));
			}
          if (m_bcVer == BTV_SE) {
            ShootProjectile(PRT_BEAST_BIG_PROJECTILE, FLOAT3D( 0.0f, 1.5f*HUGE_BEAST_STRETCH, 0.0f),
            ANGLE3D(0.0f, 0.0f, 0.0f));
			}
          if (m_bcVer == BTV_MIX) {
            ShootProjectile(PRT_BEAST_BIG_PROJECTILE, FLOAT3D( 0.0f, 1.5f*HUGE_BEAST_STRETCH, 0.0f),
            ANGLE3D(0.0f, 0.0f, 0.0f));
			}
          m_iCounter++;
        }
        m_fAttackFireTime = 7.0f;
      }
      
      if( GetHealth() > m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<3)
        {
          StartModelAnim(BEAST_ANIM_ATTACK, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, BEASTSOUND(FIRE), SOF_3D);
          autowait(0.5f);
          if (m_bcVer == BTV_FE) {
            ShootProjectile(PRT_DEVIL_GUIDED_PROJECTILE, FLOAT3D( 0.0f, 1.5f*HUGE_BEAST_STRETCH, 0.0f),
			ANGLE3D(AngleDeg((FRnd()-0.5)*30.0f), AngleDeg(FRnd()*10.0f), 0));
			}
          if (m_bcVer == BTV_SE) {
            ShootProjectile(PRT_BEAST_BIG_PROJECTILE, FLOAT3D( 0.0f, 1.5f*HUGE_BEAST_STRETCH, 0.0f),
            ANGLE3D(0.0f, 0.0f, 0.0f));
			}
          if (m_bcVer == BTV_MIX) {
            ShootProjectile(PRT_BEAST_BIG_PROJECTILE, FLOAT3D( 0.0f, 1.5f*HUGE_BEAST_STRETCH, 0.0f),
            ANGLE3D(0.0f, 0.0f, 0.0f));
			}
          m_iCounter++;
        }
      }
    }

    if( m_bcType == BT_E)
    {
      StartModelAnim(BEAST_ANIM_ATTACK, AOF_SMOOTHCHANGE);
      autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
      PlaySound(m_soSound, SOUND_FIRE, SOF_3D);
      autowait(0.51f);

      ShootProjectile(PRT_BEAST_E_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BEAST_STRETCH, 0.0f),
        ANGLE3D(AngleDeg((FRnd()-0.00)*0.0f), AngleDeg(FRnd()*0.0f), 0));
      autowait(0.3f);
    }
    
    if(m_bcType == BT_SB)
    {
      if( GetHealth() <= m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<6)
        {
          StartModelAnim(BEAST_ANIM_ATTACKFAST, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, BEASTSOUND(FIRE), SOF_3D);
          autowait(0.34f);
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BEAST_STRETCH, 0.0f),
			ANGLE3D(AngleDeg((FRnd()-0.5)*30.0f), AngleDeg(FRnd()*10.0f), 0));
          m_iCounter++;
        }
        m_fAttackFireTime = 7.0f;
      }
      
      if( GetHealth() > m_fMaxHealth/2)
      {
        m_iCounter = 0;
        while ( m_iCounter<3)
        {
          StartModelAnim(BEAST_ANIM_ATTACK, AOF_SMOOTHCHANGE);
          autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    

          PlaySound(m_soSound, BEASTSOUND(FIRE), SOF_3D);
          autowait(0.5f);
            ShootProjectile(PRT_BEAST_PROJECTILE, FLOAT3D( 0.0f, 1.5f*BEAST_STRETCH, 0.0f),
			ANGLE3D(AngleDeg((FRnd()-0.5)*30.0f), AngleDeg(FRnd()*10.0f), 0));
          m_iCounter++;
        }
      }
    }

    MaybeSwitchToAnotherPlayer();

    autowait(FRnd()/2 + _pTimer->TickQuantum); 

    if( m_penEnemy != NULL)
    {
      FLOAT fEnemyDistance = CalcDist(m_penEnemy);
      if( fEnemyDistance>m_fCloseDistance*1.25f)
      {
        StartModelAnim(BEAST_ANIM_IDLETOWALK, AOF_SMOOTHCHANGE);
        autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
        autowait(GetModelObject()->GetAnimLength(BEAST_ANIM_IDLETOWALK)/2.0f - _pTimer->TickQuantum); 
      }
    }
    

    return EReturn();
  };

  // hit enemy
  Hit(EVoid) : CEnemyBase::Hit {
    DeactivateRunningSound();
    // close attack
    StartModelAnim(BEAST_ANIM_KICK, 0);
    PlaySound(m_soWoosh, SOUND_WOOSH, SOF_3D);
    autowait(0.45f);
    /*
    StartModelAnim(BEAST_ANIM_KICK, AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    */
    if (CalcDist(m_penEnemy) < m_fCloseDistance) {
      FLOAT3D vDirection = m_penEnemy->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
      if (m_bcType == BT_BIG) {
        PlaySound(m_soSound, SOUND_KICKBIG, SOF_3D);
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 80.0f, FLOAT3D(0, 0, 0), vDirection);
      } else if (m_bcType == BT_HUGE) {
        PlaySound(m_soSound, SOUND_KICKBIG, SOF_3D);
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 120.0f, FLOAT3D(0, 0, 0), vDirection);
      } else  {
        PlaySound(m_soSound, SOUND_KICK, SOF_3D);
        InflictDirectDamage(m_penEnemy, this, DMT_CLOSERANGE, 40.0f, FLOAT3D(0, 0, 0), vDirection);
      }
    }

    /*
    StartModelAnim(BEAST_ANIM_IDLE, AOF_SMOOTHCHANGE);
    autocall CMovableModelEntity::WaitUntilScheduledAnimStarts() EReturn;    
    */
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
    en_tmMaxHoldBreath = 60.0f;

    en_fDensity = 1100.0f;
    // set your appearance
    SetModel(MODEL_BEAST);
    StandingAnim();
    // setup moving speed
    m_fWalkSpeed = FRnd()*2 + 7.0f;
    m_aWalkRotateSpeed = AngleDeg(FRnd()*20.0f + 900.0f);
    m_fCloseRunSpeed = FRnd() + 10.0f;
    m_aCloseRotateSpeed = AngleDeg(FRnd()*100 + 900.0f);
    // setup attack distances
    m_fAttackDistance = 500.0f;
    m_fCloseDistance = 0.0f;
    m_fStopDistance = 0.0f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 750.0f;
    m_fStopDistance = 5.0f;
    m_fCloseDistance = 7.0f;
    m_tmGiveUp = Max(m_tmGiveUp, 10.0f);

    // damage/explode properties
    if (m_bcType == BT_NORMAL)
    {
      m_fAttackRunSpeed = 6.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(400.0f);
      SetModelMainTexture(TEXTURE_BEAST_NORMAL);
		m_fgibTexture = TEXTURE_BEAST_NORMAL;
      m_fBlowUpAmount = 700.0f;
	    m_fBlowUpSize = 4.0f;
      m_fBodyParts = 6;
      m_fDamageWounded = 250.0f;
      m_iScore = 5000;//500
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(BEAST_STRETCH, BEAST_STRETCH, BEAST_STRETCH));
     ModelChangeNotify();
      m_sptType = SPT_SLIME;
      m_fAttackFireTime = 3.0f;
    }
     if (m_bcType == BT_BIG)
    {
      m_fAttackRunSpeed = 25.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(3000.0f);//500
      SetModelMainTexture(TEXTURE_BEAST_BIG);
		m_fgibTexture = TEXTURE_BEAST_BIG;
      m_fBlowUpAmount = 10000000.0f;//500
	    m_fBlowUpSize = 24.0f;
      m_fBodyParts = 10;
      m_fDamageWounded = 650.0f;//500
      m_iScore = 25000; //1000
      m_fStopDistance = 15;
      m_fCloseDistance = 20;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(BIG_BEAST_STRETCH, BIG_BEAST_STRETCH, BIG_BEAST_STRETCH));
      ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 5.0f;
    }
     if (m_bcType == BT_HUGE)
    {
      m_fAttackRunSpeed = 35.0f;//8
      m_aAttackRotateSpeed = AngleDeg(600.0f);
      SetHealth(6000.0f);//500
      SetModelMainTexture(TEXTURE_BEAST_HUGE);
		m_fgibTexture = TEXTURE_BEAST_HUGE;
      m_fBlowUpAmount = 10000000.0f;//500
      m_fBodyParts = 20;
      m_fDamageWounded = 1650.0f;//500
      m_iScore = 40000; //1000
      m_fStopDistance = 75;
      m_fCloseDistance = 80;
      m_fAttackDistance = 1000.0f;
      m_fIgnoreRange = 1200.0f;
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(HUGE_BEAST_STRETCH, HUGE_BEAST_STRETCH, HUGE_BEAST_STRETCH));
      ModelChangeNotify();
      m_sptType = SPT_BLOOD;
      m_fAttackFireTime = 5.0f;
    }
    if (m_bcType == BT_E)
    {
      m_fAttackRunSpeed = 6.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(400.0f);
      SetModelMainTexture(TEXTURE_BEAST_ELECTRIC);
		m_fgibTexture = TEXTURE_BEAST_ELECTRIC;
      m_fBlowUpAmount = 700.0f;
	    m_fBlowUpSize = 4.0f;
      m_fBodyParts = 6;
      m_fDamageWounded = 250.0f;
      m_iScore = 7500;//500
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(BEAST_STRETCH, BEAST_STRETCH, BEAST_STRETCH));
     ModelChangeNotify();
      m_sptType = SPT_SLIME;
      m_fAttackFireTime = 3.0f;
    }
    if (m_bcType == BT_SB)
    {
      m_fAttackRunSpeed = 6.0f;//6
      m_aAttackRotateSpeed = AngleDeg(3600.0f);
      SetHealth(400.0f);
      SetModelMainTexture(TEXTURE_BEAST_NORMAL);
		m_fgibTexture = TEXTURE_BEAST_NORMAL;
      m_fBlowUpAmount = 700.0f;
	    m_fBlowUpSize = 4.0f;
      m_fBodyParts = 6;
      m_fDamageWounded = 200.0f;
      m_iScore = 5000;//500
      // set stretch factor
      GetModelObject()->StretchModel(FLOAT3D(BEAST_STRETCH, BEAST_STRETCH, BEAST_STRETCH));
     ModelChangeNotify();
      m_sptType = SPT_SLIME;
      m_fAttackFireTime = 5.0f;
    }
    
    m_fMaxHealth = GetHealth();
    m_bRunSoundPlaying = FALSE;

    // continue behavior in base class
    jump CEnemyBase::MainLoop();
  };
};
