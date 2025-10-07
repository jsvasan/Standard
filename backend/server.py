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
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


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


# Email configuration
GMAIL_EMAIL = os.environ.get('GMAIL_EMAIL')
GMAIL_PASSWORD = os.environ.get('GMAIL_PASSWORD')

# Email sending function
async def send_email_notification(admin_email: str, registration_data: dict):
    try:
        # Format registration data for email
        # Calculate age from date of birth
        from datetime import datetime
        try:
            dob = datetime.strptime(registration_data['personalInfo']['dateOfBirth'], '%Y-%m-%d')
            today = datetime.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        except:
            age = "N/A"
        
        email_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
            <div style="background: #007AFF; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">New Health Registration Submitted</h2>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #007AFF; border-bottom: 2px solid #007AFF; padding-bottom: 10px;">Registrant's Personal Information</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold; width: 40%;">Full Name:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['registrantName']}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Apartment Number:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['registrantAptNumber']}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold;">Date of Birth:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['dateOfBirth']} (Age: {age} years)</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Mobile Phone:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['registrantPhone']}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold;">Blood Group:</td>
                        <td style="padding: 12px;"><strong style="color: #FF3B30; font-size: 16px;">{registration_data['personalInfo']['bloodGroup']}</strong></td>
                    </tr>
                </table>
                
                <h3 style="color: #007AFF; border-bottom: 2px solid #007AFF; padding-bottom: 10px;">Medical Information</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold; width: 40%;">Insurance Policy Number:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['insurancePolicy'] or 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Insurance Company / ECHS:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['insuranceCompany'] or 'Not provided'}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold;">Doctor's Name:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['doctorName'] or 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Doctor's Contact:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['doctorContact'] or 'Not provided'}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold;">Hospital Name:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['hospitalName'] or 'Not provided'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Hospital Registration Number:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['hospitalNumber'] or 'Not provided'}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold; vertical-align: top;">Current Ailments:</td>
                        <td style="padding: 12px;">{registration_data['personalInfo']['currentAilments'] or 'None reported'}</td>
                    </tr>
                </table>
                
                <h3 style="color: #007AFF; border-bottom: 2px solid #007AFF; padding-bottom: 10px; margin-top: 30px;">Buddies Information</h3>
                """
        
        for idx, buddy in enumerate(registration_data['buddies'], 1):
            bg_color = '#f5f5f5' if idx % 2 == 0 else 'white'
            email_body += f"""
                <div style="background: {bg_color}; padding: 15px; margin-bottom: 15px; border-radius: 5px; border-left: 4px solid #34C759;">
                    <h4 style="margin: 0 0 10px 0; color: #34C759;">Buddy {idx}</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold; width: 35%;">Name:</td>
                            <td style="padding: 8px;">{buddy['name']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Phone:</td>
                            <td style="padding: 8px;">{buddy['phone']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Email:</td>
                            <td style="padding: 8px;">{buddy['email']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Apartment Number:</td>
                            <td style="padding: 8px;">{buddy['aptNumber']}</td>
                        </tr>
                    </table>
                </div>
            """
        
        email_body += """
                <h3 style="color: #007AFF; border-bottom: 2px solid #007AFF; padding-bottom: 10px; margin-top: 30px;">Next of Kin Contacts</h3>
                """
        
        for idx, kin in enumerate(registration_data['nextOfKin'], 1):
            bg_color = '#f5f5f5' if idx % 2 == 0 else 'white'
            email_body += f"""
                <div style="background: {bg_color}; padding: 15px; margin-bottom: 15px; border-radius: 5px; border-left: 4px solid #FF9500;">
                    <h4 style="margin: 0 0 10px 0; color: #FF9500;">Contact {idx}</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold; width: 35%;">Name:</td>
                            <td style="padding: 8px;">{kin['name']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Phone:</td>
                            <td style="padding: 8px;">{kin['phone']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Email:</td>
                            <td style="padding: 8px;">{kin['email']}</td>
                        </tr>
                    </table>
                </div>
            """
        
        email_body += """
            </div>
            
            <div style="background: #f0f0f0; padding: 20px; text-align: center; margin-top: 20px; border-radius: 8px;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    This registration was submitted via the Health Registration App<br>
                    Registration Date: """ + datetime.now().strftime('%B %d, %Y at %I:%M %p') + """
                </p>
            </div>
        </div>
        </body>
        </html>
        """
        
        # Create email message
        message = MIMEMultipart('alternative')
        message['From'] = GMAIL_EMAIL
        message['To'] = admin_email
        message['Subject'] = f"New Health Registration - {registration_data['personalInfo']['registrantName']}"
        
        html_part = MIMEText(email_body, 'html')
        message.attach(html_part)
        
        # Send email via Gmail SMTP
        await aiosmtplib.send(
            message,
            hostname='smtp.gmail.com',
            port=587,
            username=GMAIL_EMAIL,
            password=GMAIL_PASSWORD,
            start_tls=True
        )
        
        logger.info(f"Email sent successfully to {admin_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

# Define Models
class Admin(BaseModel):
    name: str
    phone: str
    email: EmailStr
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class AdminCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr

class AdminResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str
    createdAt: datetime

class PersonalInfo(BaseModel):
    registrantName: str
    registrantAptNumber: str
    dateOfBirth: str
    registrantPhone: str
    bloodGroup: str
    insurancePolicy: Optional[str] = ""
    insuranceCompany: Optional[str] = ""
    doctorName: Optional[str] = ""
    doctorContact: Optional[str] = ""
    hospitalName: Optional[str] = ""
    hospitalNumber: Optional[str] = ""
    currentAilments: Optional[str] = ""

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

# Admin endpoints
@api_router.post("/admin/register", response_model=AdminResponse)
async def register_admin(admin: AdminCreate):
    try:
        # Check if admin already exists
        existing_admin = await db.admins.find_one({})
        if existing_admin:
            raise HTTPException(status_code=400, detail="Admin already exists. Only one admin is allowed.")
        
        admin_dict = admin.dict()
        admin_dict['createdAt'] = datetime.utcnow()
        
        result = await db.admins.insert_one(admin_dict)
        created_admin = await db.admins.find_one({"_id": result.inserted_id})
        
        return AdminResponse(
            id=str(created_admin['_id']),
            name=created_admin['name'],
            phone=created_admin['phone'],
            email=created_admin['email'],
            createdAt=created_admin['createdAt']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering admin: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin", response_model=Optional[AdminResponse])
async def get_admin():
    try:
        admin = await db.admins.find_one({})
        if not admin:
            return None
        
        return AdminResponse(
            id=str(admin['_id']),
            name=admin['name'],
            phone=admin['phone'],
            email=admin['email'],
            createdAt=admin['createdAt']
        )
    except Exception as e:
        logger.error(f"Error fetching admin: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/registrations", response_model=RegistrationResponse)
async def create_registration(registration: RegistrationCreate):
    try:
        # Validate buddies count (1-2 buddies, at least 1 required)
        if len(registration.buddies) < 1 or len(registration.buddies) > 2:
            raise HTTPException(status_code=400, detail="Between 1 and 2 buddies are required (at least 1 is mandatory)")
        
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
        
        response_data = RegistrationResponse(
            id=str(result_reg['_id']),
            personalInfo=PersonalInfo(**result_reg['personalInfo']),
            buddies=[Buddy(**buddy) for buddy in result_reg['buddies']],
            nextOfKin=[NextOfKin(**kin) for kin in result_reg['nextOfKin']],
            createdAt=result_reg['createdAt']
        )
        
        # Send email notification to admin
        admin = await db.admins.find_one({})
        if admin:
            await send_email_notification(admin['email'], reg_dict)
        
        return response_data
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
