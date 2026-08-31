from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Room, Hotel, User
from app.schemas.schemas import RoomOut, RoomCreate, RoomUpdate
from app.routes.auth import get_current_admin

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("", response_model=List[RoomOut])
def list_rooms(
    hotel_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    capacity: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Room)
    if hotel_id is not None:
        query = query.filter(Room.hotel_id == hotel_id)
    if status:
        query = query.filter(Room.status == status)
    if capacity:
        query = query.filter(Room.capacity >= capacity)
    return query.all()

@router.get("/{room_id}", response_model=RoomOut)
def get_room_detail(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.post("", response_model=RoomOut)
def create_room(
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    hotel = db.query(Hotel).filter(Hotel.id == room_in.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=400, detail="Associated Hotel not found")

    new_room = Room(**room_in.dict())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.put("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    room_update: RoomUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    for field, value in room_update.dict(exclude_unset=True).items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)
    return room

@router.delete("/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}
