/* Copyright (c) 2021-2024 Uni Musuotankarep.
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */

1037
%{
#include "StdH.h"
%}

uses "EntitiesMP/EnemyBase";
uses "EntitiesMP/EnemyMarker";

enum EnemySoundType {
  0 EST_NONE         "None",
  1 EST_SIGHT        "Sight",
  2 EST_WOUND        "Wound",
  3 EST_DEATH        "Death",
  4 EST_IDLE         "Idle",
  5 EST_TAUNT        "Taunt",
};

enum EnemyActionType {
  0 EAT_ANIM      "Play Animation",
  1 EAT_SOUND     "Play Sound",
  2 EAT_MOVE      "Move to Marker",
  3 EAT_RADIUS    "Stand Guard",
  4 EAT_RADIUS2   "Move Freely",
};

// event sent to the enemy/NPC that should do this
event EChangeSequence {
  INDEX iModelAnim,
  CEntityPointer penEnemyMarker,
  enum EnemySoundType estSoundType,
  BOOL bLoopAnimation,
  CEntityPointer penAttackTarget,
  RANGE faeAttackRadius,
  RANGE faeAttackRadius2,
};

class CEnemyActionMarker : CRationalEntity {
name      "EnemyActionMarker";
thumbnail "Thumbnails\\EnemyActionMarker.tbn";
features "HasName", "HasTarget", "IsTargetable";

properties:

  1 CTString m_strName                  "Name" 'N' = "Enemy Action Marker",           // class name
  3 ANIMATION m_iEnemyAnim              "Enemy Animation" 'M' = 0,
  4 CEntityPointer m_penTarget          "Marker Target" 'T' COLOR(C_RED|0xFF),
  5 CEntityPointer m_penEnemy           "Enemy" COLOR(C_GREEN|0xFF),
  6 enum EnemySoundType m_estSoundType  "Enemy Sound Type" = EST_NONE,
  7 BOOL m_bLoopAnimation               "Loop Animation" = FALSE,
  8 enum EnemyActionType m_eatActionType  "Enemy Action Type" = EAT_ANIM,
  9 RANGE m_faeAttackRadius              = 10000.0f,
 10 RANGE m_faeAttackRadius2             = 10000.0f,

components:

  1 model   MODEL_MARKER     "Models\\Editor\\PlayerActionMarker.mdl",
  2 texture TEXTURE_MARKER   "ModelsF\\Editor\\EnemyActionMarker.tex"

functions:

  /* Get anim data for given animation property - return NULL for none. */
  CAnimData *GetAnimData(SLONG slPropertyOffset) 
  {
    CEntity *penTarget = m_penEnemy;

    if (penTarget==NULL) {
      return NULL;
    }

    // if enemy
    if (IsDerivedFromClass(penTarget, "Enemy Base")) {
      CEnemyBase *penEnemy = (CEnemyBase*)&*penTarget;
      if (slPropertyOffset==offsetof(CEnemyActionMarker, m_iEnemyAnim)) {
        if(penEnemy->GetRenderType()==CEntity::RT_SKAMODEL) {
          return CEntity::GetAnimData(slPropertyOffset);
        } else {
          return penEnemy->GetModelObject()->GetData();
        }
      }
    }

    return CEntity::GetAnimData(slPropertyOffset);
  };

procedures:

  Main()
  {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    if (m_penEnemy==NULL) {
      return;
    }

    // check enemy type
    if (m_penEnemy!=NULL && 
      !IsDerivedFromClass(m_penEnemy, "Enemy Base")) {
      WarningMessage("Enemy target must be derived from EnemyBase!");
      m_penEnemy=NULL;
    }

    if (m_penTarget==NULL) {
      return;
    }

    // check marker type
    if (m_penTarget!=NULL && 
      !IsOfClass(m_penTarget, "Enemy Marker")) {
      WarningMessage("Marker Target must be EnemyMarker!");
      m_penTarget=NULL;
    }

    // spawn in world editor
    autowait(0.1f);
    
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : {
	    if (m_eatActionType==EAT_ANIM && m_penEnemy!=NULL) {
          EChangeSequence eSequence;
          eSequence.iModelAnim = m_iEnemyAnim;
          eSequence.bLoopAnimation = m_bLoopAnimation;
          m_penEnemy->SendEvent(eSequence);
          resume;
		  }
	    else if (m_eatActionType==EAT_SOUND && m_penEnemy!=NULL) {
          EChangeSequence eSequence;
          eSequence.estSoundType  = m_estSoundType;
          m_penEnemy->SendEvent(eSequence);
          resume;
		  }
	    else if (m_eatActionType==EAT_MOVE && m_penEnemy!=NULL) {
          EChangeSequence eSequence;
          eSequence.penEnemyMarker = m_penTarget;
          m_penEnemy->SendEvent(eSequence);
          resume;
		  }
	    else if (m_eatActionType==EAT_RADIUS && m_penEnemy!=NULL) {
          EChangeSequence eSequence;
          eSequence.faeAttackRadius = m_faeAttackRadius;
          m_penEnemy->SendEvent(eSequence);
          resume;
		  }
	    else if (m_eatActionType==EAT_RADIUS2 && m_penEnemy!=NULL) {
          EChangeSequence eSequence;
          eSequence.faeAttackRadius2 = m_faeAttackRadius2;
          m_penEnemy->SendEvent(eSequence);
          resume;
		  }
      }
      on (EEnd) : { stop; }
    }
    

    // cease to exist
    Destroy();

    return;
    }
  };
