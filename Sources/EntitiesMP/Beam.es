202
%{
#include "StdH.h"
%}

enum BeamType {
  1 BM_LASER_WHITE        "Laser white",
  2 BM_LASER_RED          "Laser red",
  3 BM_LASER_BLUE         "Laser blue",
  4 BM_LASER_YELLOW       "Laser yellow",
  5 BM_LASER_GREEN        "Laser green",
  6 BM_LASER_VIOLET       "Laser violet",
  7 BM_GHOSTBUSTER        "Ghostbuster beam",
  8 BM_FIREBREATH         "Fire breath",
};

class CBeam: CRationalEntity {
name      "Beam";
thumbnail "Thumbnails\\Beam.tbn";
features  "HasName", "HasTarget", "IsTargetable";

properties:

  1 CTString m_strName          "Name" 'N' = "Beam",
  3 CTString m_strDescription = "",
  2 CEntityPointer m_penTarget  "Target" 'T' COLOR(C_dGREEN|0xFF),
  6 FLOAT3D m_vBeamTarget = FLOAT3D( 0,0,0),
  5 FLOAT3D m_vBeamSource = FLOAT3D( 0,0,0),      // position of ray target
  7 BOOL m_bActive                "Active" 'A' = FALSE,
  8 BOOL m_bRenderBeam = FALSE,   
  9 FLOAT m_fSize "Size" 'S' = 1.0f, 
 10 enum BeamType m_bmType "Type"    'Y' = BM_LASER_WHITE,
 11 INDEX m_fCount "Count" 'C' = 16, 
 14 FLOAT m_tmFireBreathStart = 0.0f,
 12 FLOAT m_tmFireBreathStop  = 0.0f,
 13 FLOAT m_tmFireBreathLife "Fire breath life time" = 2.0f,
 15 FLOAT m_tmFireBreathLength "Fire breath length" = 1.0f,


components:

  1 model   MODEL_MARKER     "ModelsF\\Editor\\Beam.mdl",
  2 texture TEXTURE_MARKER   "ModelsF\\Editor\\Beam.tex"


functions:

  // dump sync data to text file
  export void DumpSync_t(CTStream &strm, INDEX iExtensiveSyncCheck)  // throw char *
  {
    CRationalEntity::DumpSync_t(strm, iExtensiveSyncCheck);
    strm.FPrintF_t("Type: %d\n", m_bmType);
  }

  /* Read from stream. */
  void Read_t( CTStream *istr) // throw char *
  {
    CRationalEntity::Read_t(istr);
  }

  // render particles
  void RenderParticles(void)
  {
    if( m_penTarget==NULL) {return;};

    if(!m_bActive)
    {
      return;
    } else {

      // calculate ray
      FLOAT3D m_vBeamSource = GetPlacement().pl_PositionVector;
      FLOAT3D m_vBeamTarget = m_penTarget->GetPlacement().pl_PositionVector;
      switch (m_bmType)
      {
       case BM_LASER_WHITE:   
        Particles_WhiteLaser(this, m_vBeamSource, m_vBeamTarget, m_fSize);
        break;
       case BM_LASER_RED:    
        Particles_RedLaser(this, m_vBeamSource, m_vBeamTarget, m_fSize);
        break;
       case BM_LASER_BLUE:    
        Particles_BlueLaser(this, m_vBeamSource, m_vBeamTarget, m_fSize);
        break;
       case BM_LASER_YELLOW:    
        Particles_YellowLaser(this, m_vBeamSource, m_vBeamTarget, m_fSize);
        break;
       case BM_LASER_GREEN:    
        Particles_GreenLaser(this, m_vBeamSource, m_vBeamTarget, m_fSize);
        break;
       case BM_LASER_VIOLET:    
        Particles_VioletLaser(this, m_vBeamSource, m_vBeamTarget, m_fSize);
        break;
       case BM_GHOSTBUSTER:    
        Particles_Ghostbuster(m_vBeamSource, m_vBeamTarget, m_fCount, m_fSize);
        break;
       case BM_FIREBREATH:
        Particles_FireBreath2(this, m_vBeamSource, m_vBeamTarget, 
		    m_tmFireBreathStart, m_tmFireBreathStop, m_tmFireBreathLife, m_fCount, m_fSize);
        break;
	   }
	}
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CBeam) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strName.Length();
    slUsedMemory += m_strDescription.Length();
    return slUsedMemory;
  }


procedures:

  Main()
  {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    // Wait for the game to start
    autowait(0.05f);

    wait() {
      on (EActivate) : {
        m_bActive = TRUE;
		if (m_bmType==BM_FIREBREATH) {
          m_tmFireBreathStart = _pTimer->CurrentTick();
          m_tmFireBreathStop = _pTimer->CurrentTick() + m_tmFireBreathLength;
		  }
        resume;
      }
      on (EDeactivate) : {
        m_bActive = FALSE;
        resume;
      }
      otherwise() : { resume; }
    }
  };
};

