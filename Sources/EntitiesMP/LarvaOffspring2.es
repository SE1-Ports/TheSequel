307
%{
#include "StdH.h"
#include "EntitiesMP/EnemyBase.h"
#include "ModelsMP/Enemies/ExotechLarva/Projectile/TailProjectile.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemyRunInto";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Light";
uses "EntitiesMP/Flame";

%{
#define LARVA_SIZE 1.0f

// info structure
static EntityInfo eiLarva = {
  EIBT_FLESH, 100.0f,
  0.0f, 0.5f*LARVA_SIZE, 0.0f,     // source (eyes)
  0.0f, 0.5f*LARVA_SIZE, 0.0f,     // target (body)
};

%}


class CLarvaOffspring2: CEnemyRunInto {
name      "LarvaOffspring2";
thumbnail "Thumbnails\\LarvaOffspring.tbn";

properties:
 19 BOOL m_bExplode = FALSE,                 // explode -> range damage
 30 CSoundObject m_soEffect,          // sound channel

 12 RANGE m_rFallOffRange  "Explosion Fall-off" 'F' = 3.0f,
 13 RANGE m_rHotSpotRange  "Explosion Hot-spot" 'H' =  2.0f,
 14 FLOAT m_fAmmount "Explosion Damage" 'A' = 10.0f,             // ammount of damage
 15 FLOAT m_iLarvaSpeed                  "Speed" = 30.0f,
 16 FLOAT m_fHealth            "Health" = 10.0f,
 17 FLOAT m_fStretch "Stretch" = LARVA_SIZE,
  
components:
  0 class   CLASS_BASE        "Classes\\EnemyRunInto.ecl",
  1 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

10 model   MODEL_LARVA_TAIL          "ModelsMP\\Enemies\\ExotechLarva\\Projectile\\TailProjectile.mdl",
11 texture TEXTURE_LARVA_TAIL        "ModelsMP\\Enemies\\ExotechLarva\\Projectile\\TailProjectile.tex",
12 sound   SOUND_LARVETTE            "ModelsMP\\Enemies\\ExotechLarva\\Sounds\\Squeak.wav",

functions:

  void Precache(void) {
    CEnemyBase::Precache();

	PrecacheSound(SOUND_LARVETTE);
    PrecacheModel(MODEL_LARVA_TAIL);
    PrecacheTexture(TEXTURE_LARVA_TAIL);
    PrecacheClass(CLASS_BASIC_EFFECT, BET_ROCKET);    
	PrecacheClass(CLASS_BASIC_EFFECT, BET_SHOCKWAVE); 
  };

  /* Entity info */
  void *GetEntityInfo(void) {
    return &eiLarva;
  };

  /* Receive damage */
  void ReceiveDamage(CEntity *penInflictor, enum DamageType dmtType,
    FLOAT fDamageAmmount, const FLOAT3D &vHitPoint, const FLOAT3D &vDirection) 
  {
    // larva can't harm larva
    if (!IsOfClass(penInflictor, "LarvaOffspring2")) {
      CEnemyBase::ReceiveDamage(penInflictor, dmtType, fDamageAmmount, vHitPoint, vDirection);
    }
  };

  void AdjustDifficulty(void)
  {
    // bull must not change its speed at different difficulties
  }


// Calculate current rotation speed to rich given orientation in future
ANGLE GetRotationSpeed(ANGLE aWantedAngle, ANGLE aRotateSpeed, FLOAT fWaitFrequency)
{
  ANGLE aResult;
  // if desired position is smaller
  if ( aWantedAngle<-aRotateSpeed*fWaitFrequency)
  {
    // start decreasing
    aResult = -aRotateSpeed;
  }
  // if desired position is bigger
  else if (aWantedAngle>aRotateSpeed*fWaitFrequency)
  {
    // start increasing
    aResult = +aRotateSpeed;
  }
  // if desired position is more-less ahead
  else
  {
    aResult = aWantedAngle/fWaitFrequency;
  }
  return aResult;
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

      // inflict damage
      FLOAT3D vSource;
      GetEntityInfoPosition(this, eiLarva.vTargetCenter, vSource);
        InflictDirectDamage(this, this, DMT_EXPLOSION, 100.0f, vSource, 
          -en_vGravityDir);
        InflictRangeDamage(this, DMT_EXPLOSION, m_fAmmount, vSource, m_rHotSpotRange, m_rFallOffRange);

      // spawn explosion
      CPlacement3D plExplosion = GetPlacement();
      CEntityPointer penExplosion = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      ESpawnEffect eSpawnEffect;
      eSpawnEffect.colMuliplier = C_WHITE|CT_OPAQUE;
      eSpawnEffect.betType = BET_BOMB;
      eSpawnEffect.vStretch = (FLOAT3D(1.0f,1.0f,1.0f)*m_fStretch);
      penExplosion->Initialize(eSpawnEffect);

      // explosion debris
      eSpawnEffect.betType = BET_EXPLOSION_DEBRIS;
      CEntityPointer penExplosionDebris = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionDebris->Initialize(eSpawnEffect);

      // explosion smoke
      eSpawnEffect.betType = BET_EXPLOSION_SMOKE;
      CEntityPointer penExplosionSmoke = CreateEntity(plExplosion, CLASS_BASIC_EFFECT);
      penExplosionSmoke->Initialize(eSpawnEffect);

    // hide yourself (must do this after spawning debris)
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
  };


/************************************************************
 *                      ATTACK FUNCTIONS                    *
 ************************************************************/
  // touched another live entity
  void LiveEntityTouched(ETouch etouch) {
    if (m_penLastTouched!=etouch.penOther || _pTimer->CurrentTick()>=m_fLastTouchedTime+0.25f) {
      // hit angle
      FLOAT3D vDirection = en_vCurrentTranslationAbsolute;
      vDirection.Normalize();
      ANGLE aHitAngle = FLOAT3D(etouch.plCollision)%vDirection;
      // only hit target in front of you
      if (aHitAngle < 0.0f) {
        // increase mass - only if not another bull
        if (!IsOfSameClass(this, etouch.penOther)) {
          IncreaseKickedMass(etouch.penOther);
        }
        // store last touched
        m_penLastTouched = etouch.penOther;
        m_fLastTouchedTime = _pTimer->CurrentTick();
        // damage
      }
    }
  };

  // touched entity with higher mass
  BOOL HigherMass(void) {
    return (m_fMassKicked > 10.0f);
  };

procedures:
  // close range -> move toward enemy and keep moving
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

      autocall LarvaOffspringGuidedSlide() EReturn;
    }
  }
   
  LarvaOffspringGuidedSlide(EVoid) {
    // fly loop
    while( _pTimer->CurrentTick())
    {
      FLOAT fWaitFrequency = 0.1f;
      if (m_penEnemy!=NULL) {
        // calculate desired position and angle
        EntityInfo *pei= (EntityInfo*) (m_penEnemy->GetEntityInfo());
        FLOAT3D vDesiredPosition;
        GetEntityInfoPosition( m_penEnemy, pei->vSourceCenter, vDesiredPosition);
        FLOAT3D vDesiredDirection = (vDesiredPosition-GetPlacement().pl_PositionVector).Normalize();
        // for heading
        ANGLE aWantedHeading = GetRelativeHeading( vDesiredDirection);
        ANGLE aHeading = GetRotationSpeed( aWantedHeading, m_aRotateSpeed, fWaitFrequency);

        // factor used to decrease speed of LarvaOffsprings oriented opposite of its target
        FLOAT fSpeedDecreasingFactor = ((180-abs(aWantedHeading))/180.0f);
        // factor used to increase speed when far away from target
        FLOAT fSpeedIncreasingFactor = (vDesiredPosition-GetPlacement().pl_PositionVector).Length()/100;
        fSpeedIncreasingFactor = ClampDn(fSpeedIncreasingFactor, 1.0f);
        // decrease speed acodring to target's direction
        FLOAT fMaxSpeed = m_iLarvaSpeed*fSpeedIncreasingFactor;
        FLOAT fMinSpeedRatio = 0.5f;
        FLOAT fWantedSpeed = fMaxSpeed*( fMinSpeedRatio+(1-fMinSpeedRatio)*fSpeedDecreasingFactor);
        // adjust translation velocity
        SetDesiredTranslation( FLOAT3D(0, 0, -fWantedSpeed));
      
        // adjust rotation speed
        m_aRotateSpeed = 75.0f*(1+0.5f*fSpeedDecreasingFactor);
      
        // calculate distance factor
        FLOAT fDistanceFactor = (vDesiredPosition-GetPlacement().pl_PositionVector).Length()/50.0;
        fDistanceFactor = ClampUp(fDistanceFactor, 4.0f);
        FLOAT fRNDHeading = (FRnd()-0.5f)*180*fDistanceFactor;
        
        // if we are looking near direction of target
        if( abs( aWantedHeading) < 30.0f)
        {
          // adjust heading and pich
          SetDesiredRotation(ANGLE3D(aHeading+fRNDHeading,0,0));
        }
        // just adjust heading
        else
        {
          SetDesiredRotation(ANGLE3D(aHeading,0,0));
        }
      }

      wait( fWaitFrequency)
      {
        on (EBegin) : { resume; }
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
            SetHealth(-10000.0f);
            m_vDamage = FLOAT3D(0,10000,0);
            SendEvent(EDeath());
          }
          // we didn't touch ground nor player, ignore
          resume;
        }
        on (ETimer) :
        {
          stop;
        }
      }
    }
    return EEnd();
  };

  // overridable called before main enemy loop actually begins
  PreMainLoop(EVoid) : CEnemyBase::PreMainLoop {
    if (m_bQuiet) {
      m_soEffect.Set3DParameters(0.0f, 0.0f, 1.0f, 1.0f);
	} else {
      m_soEffect.Set3DParameters(50.0f, 10.0f, 1.0f, 1.0f);
      PlaySound(m_soEffect, SOUND_LARVETTE, SOF_3D|SOF_LOOP);
	  }
    return EReturn();
  }



/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    // declare yourself as a model
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_SLIDING|EPF_HASLUNGS);
    SetCollisionFlags(ECF_MODEL);
    SetFlags(GetFlags()|ENF_ALIVE);
    en_tmMaxHoldBreath = 10.0f;
    SetHealth(m_fHealth);
    m_fMaxHealth = m_fHealth;
    en_fDensity = 2000.0f;
  
  SetModel(MODEL_LARVA_TAIL);
  SetModelMainTexture(TEXTURE_LARVA_TAIL);
  GetModelObject()->StretchModel(FLOAT3D(4.0f, 4.0f, 4.0f)*m_fStretch);

    // setup moving speed
    m_fWalkSpeed = m_iLarvaSpeed;
    m_aWalkRotateSpeed = AngleDeg(275.0f);
    m_fAttackRunSpeed = m_iLarvaSpeed;
    m_fAttackRotateRunInto = AngleDeg(275.0f);
    m_aAttackRotateSpeed = m_fAttackRotateRunInto;
    m_fCloseRunSpeed = m_iLarvaSpeed;
    m_aCloseRotateSpeed = AngleDeg(275.0f);
    // setup attack distances
    m_fAttackDistance = 100.0f;
    m_fCloseDistance = 2.0f;
    m_fStopDistance = 0.0f;
    m_fAttackFireTime = 0.05f;
    m_fCloseFireTime = 1.0f;
    m_fIgnoreRange = 250.0f;
    // damage/explode properties
    m_fBlowUpAmount = 0.0f;
	m_fBlowUpSize = 2.0f;
    m_fBodyParts = 0;
    m_fDamageWounded = 100000.0f;
    m_iScore = 0;

    // continue behavior in base class
    jump CEnemyRunInto::MainLoop();
  };
};
