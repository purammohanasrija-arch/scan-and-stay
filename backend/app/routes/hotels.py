import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Hotel, Room, Feedback, User
from app.schemas.schemas import (
    HotelOut, HotelDetailOut, HotelCreate, HotelUpdate, FeedbackCreate, FeedbackOut
)
from app.routes.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/hotels", tags=["Hotels"])

@router.get("", response_model=List[HotelOut])
def list_hotels(
    search: Optional[str] = Query(None, description="Search by name, city or location"),
    city: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    rating: Optional[float] = Query(None),
    amenity: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("popular", description="popular, price_low, price_high, rating"),
    db: Session = Depends(get_db)
):
    query = db.query(Hotel)

    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(
            (Hotel.name.ilike(search_pattern)) |
            (Hotel.city.ilike(search_pattern)) |
            (Hotel.address.ilike(search_pattern)) |
            (Hotel.description.ilike(search_pattern))
        )
    
    if city:
        query = query.filter(Hotel.city.ilike(f"%{city}%"))

    if min_price is not None:
        query = query.filter(Hotel.base_price >= min_price)

    if max_price is not None:
        query = query.filter(Hotel.base_price <= max_price)

    if rating is not None:
        query = query.filter(Hotel.rating >= rating)

    if featured is not None:
        query = query.filter(Hotel.featured == featured)

    if amenity:
        query = query.filter(Hotel.amenities.ilike(f"%{amenity}%"))

    # Sorting
    if sort_by == "price_low":
        query = query.order_by(Hotel.base_price.asc())
    elif sort_by == "price_high":
        query = query.order_by(Hotel.base_price.desc())
    elif sort_by == "rating":
        query = query.order_by(Hotel.rating.desc())
    else:
        query = query.order_by(Hotel.featured.desc(), Hotel.rating.desc(), Hotel.review_count.desc())

    return query.all()

@router.get("/{hotel_id}", response_model=HotelDetailOut)
def get_hotel_detail(hotel_id: int, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel

@router.post("", response_model=HotelOut)
def create_hotel(
    hotel_in: HotelCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    slug = hotel_in.name.lower().replace(" ", "-").replace("&", "and")
    new_hotel = Hotel(
        name=hotel_in.name,
        slug=slug,
        city=hotel_in.city,
        state=hotel_in.state or "India",
        country=hotel_in.country or "India",
        address=hotel_in.address,
        latitude=hotel_in.latitude,
        longitude=hotel_in.longitude,
        rating=hotel_in.rating or 4.5,
        review_count=hotel_in.review_count or 0,
        description=hotel_in.description,
        cover_image=hotel_in.cover_image,
        gallery_images=hotel_in.gallery_images or "[]",
        amenities=hotel_in.amenities or "[]",
        featured=hotel_in.featured or False,
        base_price=hotel_in.base_price or 2499.0
    )
    db.add(new_hotel)
    db.commit()
    db.refresh(new_hotel)
    return new_hotel

@router.put("/{hotel_id}", response_model=HotelOut)
def update_hotel(
    hotel_id: int,
    hotel_update: HotelUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    update_data = hotel_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hotel, field, value)

    db.commit()
    db.refresh(hotel)
    return hotel

@router.delete("/{hotel_id}")
def delete_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    db.delete(hotel)
    db.commit()
    return {"message": "Hotel deleted successfully"}

@router.get("/{hotel_id}/feedbacks", response_model=List[FeedbackOut])
def get_hotel_feedbacks(hotel_id: int, db: Session = Depends(get_db)):
    feedbacks = db.query(Feedback).filter(Feedback.hotel_id == hotel_id).order_by(Feedback.created_at.desc()).all()
    return feedbacks

@router.post("/{hotel_id}/feedbacks", response_model=FeedbackOut)
def submit_feedback(
    hotel_id: int,
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    # Simple sentiment classification
    sentiment = "positive" if feedback_in.rating >= 4.0 else ("neutral" if feedback_in.rating == 3.0 else "negative")

    feedback = Feedback(
        user_id=current_user.id,
        hotel_id=hotel_id,
        booking_id=feedback_in.booking_id,
        rating=feedback_in.rating,
        cleanliness_rating=feedback_in.cleanliness_rating or 5.0,
        service_rating=feedback_in.service_rating or 5.0,
        location_rating=feedback_in.location_rating or 5.0,
        review_text=feedback_in.review_text,
        sentiment=sentiment
    )
    db.add(feedback)

    # Recalculate average hotel rating
    all_ratings = [f.rating for f in hotel.feedbacks] + [feedback_in.rating]
    hotel.rating = round(sum(all_ratings) / len(all_ratings), 1)
    hotel.review_count = len(all_ratings)

    db.commit()
    db.refresh(feedback)
    return feedback
