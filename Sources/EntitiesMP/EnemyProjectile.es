304
%{
#include "StdH.h"
%}


uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/SpawnerProjectile";

enum EnemyProjectileType {
  0 EPT_SIMPLE          "Simple",           // spawns on trigger
  1 EPT_RESPAWNER       "[doesn't work]",        // respawn after death
  2 EPT_DESTROYABLE     "[doesn't work]",      // spawns untill killed
  3 EPT_TRIGGERED       "Triggered",        // spawn one group on each trigger
  4 EPT_TELEPORTER      "Teleporter",       // teleport the target instead copying it - usable only once
  5 EPT_RESPAWNERBYONE  "[doesn't work]",  // respawn only one (not entire group) after death
  6 EPT_MAINTAINGROUP   "[doesn't work]",    // respawn by need to maintain the number of active enemies
  7 EPT_RESPAWNGROUP    "[doesn't work]", // respawn the whole group when it's destroyed
};


class CEnemyProjectile: CRationalEntity {
name      "Enemy Projectile";
thumbnail "Thumbnails\\EnemyProjectile.tbn";
features  "HasName", "HasTarget", "IsTargetable";

properties:

  1 CEntityPointer m_penTarget  "Template Target" 'T'  COLOR(C_BLUE|0x20),        // template entity to duplicate
  2 CTString m_strDescription = "",
  3 CTString m_strName          "Name" 'N' = "Enemy Projectile",
  
  9 FLOAT m_tmDelay             "Delay initial" 'W' = 0.0f,      // how long to delay before spawning
 16 FLOAT m_tmSingleWait        "Delay single" 'O' = 0.1f,    // delay inside one group
  5 FLOAT m_tmGroupWait         "Delay group" 'G' = 0.1f,     // delay between two groups
 17 INDEX m_ctGroupSize         "Count group"  = 1,
  8 INDEX m_ctTotal             "Count total" 'C' = 1,        // max. number of spawned enemies
 13 CEntityPointer m_penPatrol  "Patrol target" 'P'  COLOR(C_lGREEN|0xFF),          // for spawning patrolling 
 15 enum EnemyProjectileType m_estType "Type"  'Y' = EPT_SIMPLE,      // type of spawner
 18 BOOL m_bTelefrag "Telefrag" 'F' = FALSE,                  // telefrag when spawning
 19 BOOL m_bSpawnEffect "SpawnEffect" 'S' = TRUE, // show effect and play sound
 20 BOOL m_bDoubleInSerious "Double in serious mode" = FALSE,
 21 CEntityPointer m_penSeriousTarget  "Template for Serious"  COLOR(C_RED|0x20),
 22 BOOL m_bFirstPass = TRUE,
 23 INDEX m_ctVSpeed            "Speed Vertical" 'V' = 10,
 24 INDEX m_ctHSpeed            "Speed Horizontal" 'H' = 10,
 25 CEntityPointer m_penEasyTarget  "Template for Easy"  COLOR(C_BLUE|0x40),
 26 CEntityPointer m_penHardTarget  "Template for Hard"  COLOR(C_BLUE|0x60),
 
 50 CSoundObject m_soSpawn,    // sound channel
 51 INDEX m_iInGroup=0,        // in group counter for loops
 52 INDEX m_iEnemiesTriggered=0,  // number of times enemies triggered the spawner on death

 60 CEntityPointer m_penTacticsHolder  "Tactics Holder",
 61 BOOL m_bTacticsAutostart           "Tactics autostart" = TRUE,

 62 FLOAT3D m_vProjSource = FLOAT3D( 0,0,0),

 70 BOOL m_bCountAsKill "Count as kill" = TRUE,

 

components:

  1 model   MODEL_ENEMYSPAWNER     "Models\\Editor\\EnemySpawner.mdl",
  2 texture TEXTURE_ENEMYSPAWNER   "ModelsF\\Editor\\EnemyProjectile.tex",
  3 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

  4 class   CLASS_SPAWNER_PROJECTILE "Classes\\SpawnerProjectile.ecl",


functions:

  void Precache(void)
  {
    PrecacheClass(CLASS_BASIC_EFFECT, BET_TELEPORT);
  }


  const CTString &GetDescription(void) const
  {
    ((CTString&)m_strDescription).PrintF("-><none>");
    if (m_penTarget!=NULL) {
      ((CTString&)m_strDescription).PrintF("->%s", m_penTarget->GetName());
      if (m_penSeriousTarget!=NULL) {
        ((CTString&)m_strDescription).PrintF("->%s, %s", 
          m_penTarget->GetName(), m_penSeriousTarget->GetName());
      }
      if (m_penEasyTarget!=NULL) {
        ((CTString&)m_strDescription).PrintF("->%s, %s", 
          m_penTarget->GetName(), m_penEasyTarget->GetName());
      }
      if (m_penHardTarget!=NULL) {
        ((CTString&)m_strDescription).PrintF("->%s, %s", 
          m_penTarget->GetName(), m_penHardTarget->GetName());
      }
    }
    ((CTString&)m_strDescription) = EnemyProjectileType_enum.NameForValue(INDEX(m_estType))
      + m_strDescription;
    return m_strDescription;
  }


  // check if one template is valid for this spawner
  BOOL CheckTemplateValid(CEntity *pen)
  {
    if (pen==NULL || !IsDerivedFromClass(pen, "Enemy Base")) {
      return FALSE;
    }
    if (m_estType==EPT_TELEPORTER) {
      return !(((CEnemyBase&)*pen).m_bTemplate);
    } else {
      return ((CEnemyBase&)*pen).m_bTemplate;
    }
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
  {
    if( slPropertyOffset == offsetof(CEnemyProjectile, m_penTarget))
    {
      return CheckTemplateValid(penTarget);
    }
    else if( slPropertyOffset == offsetof(CEnemyProjectile, m_penPatrol))
    {
      return (penTarget!=NULL && IsDerivedFromClass(penTarget, "Enemy Marker"));
    }
    else if( slPropertyOffset == offsetof(CEnemyProjectile, m_penSeriousTarget))
    {
      return CheckTemplateValid(penTarget);
    }   
    else if( slPropertyOffset == offsetof(CEnemyProjectile, m_penEasyTarget))
    {
      return CheckTemplateValid(penTarget);
    }  
    else if( slPropertyOffset == offsetof(CEnemyProjectile, m_penHardTarget))
    {
      return CheckTemplateValid(penTarget);
    }  
    else if( slPropertyOffset == offsetof(CEnemyProjectile, m_penTacticsHolder))
    {
      if (IsOfClass(penTarget, "TacticsHolder")) { return TRUE; }
      else { return FALSE; }
    }   
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }


  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    if (m_penTarget==NULL) { return FALSE; }
    m_penTarget->FillEntityStatistics(pes);
    pes->es_ctCount = m_ctTotal;
    pes->es_strName += " (spawned)";
    if (m_penSeriousTarget!=NULL) {
      pes->es_strName += " (has serious)";
    }
    if (m_penEasyTarget!=NULL) {
      pes->es_strName += " (has easy)";
    }
    if (m_penHardTarget!=NULL) {
      pes->es_strName += " (has hard)";
    }
    return TRUE;
  }

  // spawn new entity
  void SpawnEntity(BOOL bCopy) {
    // spawn new entity if of class basic enemy
      CEntity *pen = NULL;
    ASSERT(m_penTarget!=NULL);
    CPlacement3D plProj;
    // spawn placement
    plProj = CPlacement3D(m_vProjSource, ANGLE3D(0, 0, 0));
    plProj.RelativeToAbsolute(GetPlacement());
    
    ESpawnerProjectile esp;
    CEntityPointer penSProjectile = CreateEntity(plProj, CLASS_SPAWNER_PROJECTILE);
    esp.penOwner = this;
    esp.penTemplate = m_penTarget;
    penSProjectile->Initialize(esp);
    
    ((CMovableEntity &)*penSProjectile).LaunchAsFreeProjectile(FLOAT3D(0.0f, m_ctVSpeed, -m_ctHSpeed), (CMovableEntity*)(CEntity*)this);
      
  };

  // Handle an event, return false if the event is not handled
  BOOL HandleEvent(const CEntityEvent &ee)
  {
    if (ee.ee_slEvent==EVENTCODE_ETrigger)
    {
      ETrigger eTrigger = ((ETrigger &) ee);
      if(IsDerivedFromClass(eTrigger.penCaused, "Enemy Base")) {
        m_iEnemiesTriggered++;
      }
    }
    return CRationalEntity::HandleEvent(ee);
  }


  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CEnemyProjectile) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strDescription.Length();
    slUsedMemory += m_strName.Length();
    slUsedMemory += 1* sizeof(CSoundObject);
    return slUsedMemory;
  }

procedures:

  // spawn one group of entities
  SpawnGroup() 
  {
    // no enemies in group yet
    m_iInGroup = 0;
    // repeat forever
    while(TRUE) {

      // spawn one enemy
      SpawnEntity(TRUE);

      // count total enemies spawned
      m_ctTotal--;
      // if no more left
      if (m_ctTotal<=0) {
        // finish entire spawner
        return EEnd();
      }

      // count enemies in group
      m_iInGroup++;
      // decrease the needed count
      if (m_iEnemiesTriggered>0 && m_estType==EPT_RESPAWNGROUP) {
        if (!m_bFirstPass) {
          m_iEnemiesTriggered--;
        }
      } else if (m_iEnemiesTriggered>0) {
         m_iEnemiesTriggered--;
      }

      // if entire group spawned
      if (m_iInGroup>=m_ctGroupSize) {
        if (!(m_estType==EPT_MAINTAINGROUP && m_iEnemiesTriggered>0)) {
          // finish
          return EReturn();
        }
      }

      // wait between two entities in group
      wait(m_tmSingleWait) {
        on (EBegin) : { resume; }
        on (ETimer) : { stop; }
        otherwise() : { pass; }
      }
    }
  }

  // simple spawner
  Simple()
  {
    // wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      on (EStart) : { stop; };
      otherwise() : { pass; }
    }

    // if should delay
    if (m_tmDelay>0) {
      // wait delay
      autowait(m_tmDelay);
    }

    // repeat
    while(TRUE) {
      // spawn one group
      autocall SpawnGroup() EReturn;
      // delay between groups
      autowait(m_tmGroupWait);
    }
  }

  // teleports the template
  Teleporter()
  {
    // wait to be triggered
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; };
      on (EStart) : { stop; };
      otherwise() : { pass; }
    }

    // if should delay
    if (m_tmDelay>0) {
      // wait delay
      autowait(m_tmDelay);
    }

    // teleport it
    SpawnEntity(FALSE);

    // end the spawner
    return EEnd();
  }

  // respawn enemies when killed
  Respawner()
  {
    // repeat
    while(TRUE) {
      // wait to be triggered
      wait() {
        on (EBegin) : { 
          if (!m_bFirstPass && m_iEnemiesTriggered>0) {
            stop;
          }
          resume;
        }
        on (ETrigger) : { stop; };
        on (EStart) : { stop; };
        otherwise() : { pass; }
      }
     
      // if should delay - only once, on beginning
      if (m_tmDelay>0 && m_bFirstPass) {
        // initial delay
        autowait(m_tmDelay);
      }

      if (m_estType==EPT_RESPAWNGROUP) {
        if (m_bFirstPass) {
          autocall SpawnGroup() EReturn;
        } else if (m_iEnemiesTriggered>=m_ctGroupSize) {
          if (m_tmGroupWait>0) { autowait(m_tmGroupWait); }
          autocall SpawnGroup() EReturn;
        }
      } else if (TRUE) {
        // spawn one group
        if (m_tmGroupWait>0 && !m_bFirstPass) { autowait(m_tmGroupWait); }
        autocall SpawnGroup() EReturn;
      }

      // if should continue respawning by one
      /*if (m_estType==EPT_RESPAWNERBYONE) {
        // set group size to 1
        if (m_tmGroupWait>0 && !m_bFirstPass) { autowait(m_tmGroupWait); }
        m_ctGroupSize = 1;
      }*/

      // if should continue maintaining group
      if (m_estType==EPT_MAINTAINGROUP) {
        // set group size to 1
        m_ctGroupSize = 1;
      }

      // never do an initial delay again - set FirstPass to FALSE
      m_bFirstPass = FALSE;

      // wait a bit to recover
      autowait(0.1f);
    }
  }

  DestroyableInactive()
  {
    waitevent() EActivate;
    jump DestroyableActive();
  }

  DestroyableActiveSpawning()
  {
    // repeat
    while(TRUE) {
      // spawn one group
      autocall SpawnGroup() EReturn;
      // delay between groups
      autowait(m_tmGroupWait);
    }
  }
  DestroyableActive()
  {
    autocall DestroyableActiveSpawning() EDeactivate;
    jump DestroyableInactive();
  }

  // spawn new entities until you are stopped
  Destroyable()
  {
    // start in inactive state and do until stopped
    autocall DestroyableInactive() EStop;
    // finish
    return EEnd();
  }

  Main() {
    // init as nothing
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_ENEMYSPAWNER);
    SetModelMainTexture(TEXTURE_ENEMYSPAWNER);

    if (m_tmSingleWait<=0.0f) { m_tmSingleWait=0.05f; }
    if (m_tmGroupWait<=0.0f) { m_tmGroupWait=0.05f; }

    if (m_estType==EPT_RESPAWNERBYONE) {
      m_estType=EPT_MAINTAINGROUP;
    }

    // check target
    if (m_penTarget!=NULL) {
      if (!IsDerivedFromClass(m_penTarget, "Enemy Base")) {
        WarningMessage("Target '%s' is of wrong class!", m_penTarget->GetName());
        m_penTarget = NULL;
      }
    }
    if (m_penSeriousTarget!=NULL) {
      if (!IsDerivedFromClass(m_penSeriousTarget, "Enemy Base")) {
        WarningMessage("Target '%s' is of wrong class!", m_penSeriousTarget->GetName());
        m_penSeriousTarget = NULL;
      }
    }
    if (m_penEasyTarget!=NULL) {
      if (!IsDerivedFromClass(m_penEasyTarget, "Enemy Base")) {
        WarningMessage("Target '%s' is of wrong class!", m_penEasyTarget->GetName());
        m_penEasyTarget = NULL;
      }
    }
    if (m_penHardTarget!=NULL) {
      if (!IsDerivedFromClass(m_penHardTarget, "Enemy Base")) {
        WarningMessage("Target '%s' is of wrong class!", m_penHardTarget->GetName());
        m_penHardTarget = NULL;
      }
    }

    // never start ai in wed
    autowait(_pTimer->TickQuantum);

    // destroy self if this is a multiplayer-only spawner, and flags indicate no extra enemies
    if ( !GetSP()->sp_bUseExtraEnemies && !GetSP()->sp_bSinglePlayer 
      && !(GetSpawnFlags()&SPF_SINGLEPLAYER)) {
      Destroy();
      return;
    }

    if (m_bDoubleInSerious && GetSP()->sp_gdGameDifficulty==CSessionProperties::GD_EXTREME) {
      m_ctGroupSize*=2;
      m_ctTotal*=2;
    }
    if (m_penSeriousTarget!=NULL && GetSP()->sp_gdGameDifficulty==CSessionProperties::GD_EXTREME) {
      m_penTarget = m_penSeriousTarget;
    }
    if (m_penEasyTarget!=NULL && GetSP()->sp_gdGameDifficulty==CSessionProperties::GD_TOURIST) {
      m_penTarget = m_penEasyTarget;
    }
    if (m_penEasyTarget!=NULL && GetSP()->sp_gdGameDifficulty==CSessionProperties::GD_EASY) {
      m_penTarget = m_penEasyTarget;
    }
    if (m_penHardTarget!=NULL && GetSP()->sp_gdGameDifficulty==CSessionProperties::GD_HARD) {
      m_penTarget = m_penHardTarget;
    }

    if (m_estType==EPT_MAINTAINGROUP) {
      m_iEnemiesTriggered = m_ctGroupSize;
    }

    m_bFirstPass = TRUE;

    wait() {
      on(EBegin) : {
        if(m_estType==EPT_SIMPLE) {
          call Simple();
        } else if(m_estType==EPT_TELEPORTER) {
          call Teleporter();
        } else if(m_estType==EPT_RESPAWNER /*|| m_estType==EPT_RESPAWNERBYONE*/
               || m_estType==EPT_TRIGGERED || m_estType==EPT_RESPAWNGROUP) {
          call Respawner();
        } else if(m_estType==EPT_MAINTAINGROUP) {
          m_ctGroupSize = 1;
          call Respawner();
        }
        else if(m_estType==EPT_DESTROYABLE) {
          call Destroyable();
        }
      }
      on(EDeactivate) : {
        stop;
      }
      on(EStop) : {
        stop;
      }
      on(EEnd) : {
        stop;
      }
    }

    Destroy();

    return;
  };
};
