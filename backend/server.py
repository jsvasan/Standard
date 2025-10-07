from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class PersonalInfo(BaseModel):
    registrantName: str
    registrantAptNumber: str
    dateOfBirth: str
    registrantPhone: str
    bloodGroup: str
    insurancePolicy: str
    insuranceCompany: str
    doctorName: str
    hospitalName: str
    hospitalNumber: str
    currentAilments: str

class Buddy(BaseModel):
    name: str
    phone: str
    email: EmailStr
    aptNumber: str

class NextOfKin(BaseModel):
    name: str
    phone: str
    email: EmailStr

class Registration(BaseModel):
    personalInfo: PersonalInfo
    buddies: List[Buddy]
    nextOfKin: List[NextOfKin]
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class RegistrationCreate(BaseModel):
    personalInfo: PersonalInfo
    buddies: List[Buddy]
    nextOfKin: List[NextOfKin]

class RegistrationResponse(BaseModel):
    id: str
    personalInfo: PersonalInfo
    buddies: List[Buddy]
    nextOfKin: List[NextOfKin]
    createdAt: datetime

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Registration API"}

@api_router.post("/registrations", response_model=RegistrationResponse)
async def create_registration(registration: RegistrationCreate):
    try:
        # Validate buddies count
        if len(registration.buddies) != 2:
            raise HTTPException(status_code=400, detail="Exactly 2 buddies are required")
        
        # Validate next of kin count
        if len(registration.nextOfKin) < 1 or len(registration.nextOfKin) > 3:
            raise HTTPException(status_code=400, detail="Between 1 and 3 next of kin contacts are required")
        
        # Check if registration already exists for this phone number
        existing_reg = await db.registrations.find_one({
            "personalInfo.registrantPhone": registration.personalInfo.registrantPhone
        })
        
        reg_dict = registration.dict()
        reg_dict['updatedAt'] = datetime.utcnow()
        
        if existing_reg:
            # Update existing registration
            reg_dict['createdAt'] = existing_reg['createdAt']
            await db.registrations.update_one(
                {"_id": existing_reg['_id']},
                {"$set": reg_dict}
            )
            result_reg = await db.registrations.find_one({"_id": existing_reg['_id']})
        else:
            # Create new registration
            reg_dict['createdAt'] = datetime.utcnow()
            result = await db.registrations.insert_one(reg_dict)
            result_reg = await db.registrations.find_one({"_id": result.inserted_id})
        
        return RegistrationResponse(
            id=str(result_reg['_id']),
            personalInfo=PersonalInfo(**result_reg['personalInfo']),
            buddies=[Buddy(**buddy) for buddy in result_reg['buddies']],
            nextOfKin=[NextOfKin(**kin) for kin in result_reg['nextOfKin']],
            createdAt=result_reg['createdAt']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating registration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/registrations", response_model=List[RegistrationResponse])
async def get_all_registrations():
    try:
        registrations = await db.registrations.find().to_list(1000)
        return [
            RegistrationResponse(
                id=str(reg['_id']),
                personalInfo=PersonalInfo(**reg['personalInfo']),
                buddies=[Buddy(**buddy) for buddy in reg['buddies']],
                nextOfKin=[NextOfKin(**kin) for kin in reg['nextOfKin']],
                createdAt=reg['createdAt']
            )
            for reg in registrations
        ]
    except Exception as e:
        logger.error(f"Error fetching registrations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/registrations/{registration_id}", response_model=RegistrationResponse)
async def get_registration_by_id(registration_id: str):
    try:
        if not ObjectId.is_valid(registration_id):
            raise HTTPException(status_code=400, detail="Invalid registration ID")
        
        reg = await db.registrations.find_one({"_id": ObjectId(registration_id)})
        
        if not reg:
            raise HTTPException(status_code=404, detail="Registration not found")
        
        return RegistrationResponse(
            id=str(reg['_id']),
            personalInfo=PersonalInfo(**reg['personalInfo']),
            buddies=[Buddy(**buddy) for buddy in reg['buddies']],
            nextOfKin=[NextOfKin(**kin) for kin in reg['nextOfKin']],
            createdAt=reg['createdAt']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching registration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
