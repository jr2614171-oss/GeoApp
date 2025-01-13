/// <reference lib="webworker" />

import { I_Offers } from './../../../../interface/offers.interface';
import { I_Travel } from './../../../../interface/trip.interface';

/**
 * @params currentTravels: I_Travel[] => Ofertas actuales
 * @params newTravels: I_Travel[] => Nuevas ofertas
 * @params filterTypes: string[] => tipo de filtro Ex. ['today', 'tomorrow']
 * @params functionType: string => tipo de funcion que ejecuta
 */

// Escuchar mensajes desde el hilo principal
addEventListener('message', ({ data }) => {
  const { functionType, currentTravels, newTravels, filterTypes, offers, type } = data;

  const currentDate = new Date();
  const tomorrowDate = new Date(currentDate);
  tomorrowDate.setDate(currentDate.getDate() + 1);
  const nextWeekDate = new Date(currentDate);
  nextWeekDate.setDate(currentDate.getDate() + 7);

  // Filtrar ofertas: agregar nuevas y eliminar las que ya no están
  let updatedTravels = [...currentTravels];

  switch (functionType) {
    case 'byDate':
      updatedTravels = filterTravelsByDate(
        updatedTravels,
        filterTypes,
        currentDate,
        tomorrowDate,
        nextWeekDate
      );

      break;
    case 'byOrder':
      // Ordenar las ofertas según el campo especificado
      updatedTravels = orderBy(updatedTravels);

      break;
    case 'refresh':
      
      // Agregar nuevas viajes
      updatedTravels = addNewTravels(updatedTravels, newTravels);

      // Eliminar viajes que ya no están
      updatedTravels = removeOldTravels(
        updatedTravels,
        currentTravels,
        newTravels
      );
      if(filterTypes.length > 0){
        updatedTravels = filterTravelsByDate(
          updatedTravels,
          filterTypes,
          currentDate,
          tomorrowDate,
          nextWeekDate
        );
      }

      break;
    case 'byOffers':
 

    updatedTravels = filterTravels( currentTravels, offers, type);
      

      break;

    default:
      break;
  }

  // Enviar el resultado de vuelta al hilo principal
  postMessage({ updatedTravels, filterTypes, functionType, type: type?? '' });
});

/**
 * Agregar viajes nuevas al array
 */
function addNewTravels(
  updatedTravels: I_Travel[],
  newTravels: I_Travel[]
): I_Travel[] {
  newTravels.forEach((newTravel: I_Travel) => {
    const existingTravelIndex = updatedTravels.findIndex(
      (travel) => travel.id === newTravel.id
    );
    if (existingTravelIndex === -1) {
      updatedTravels.push(newTravel);
    } else {
      // Actualizar el viaje existente si es necesario
      updatedTravels[existingTravelIndex] = {
        ...updatedTravels[existingTravelIndex],
        ...newTravel,
      };
    }
  });
  return updatedTravels;
}

/**
 * eliminar viajes viejos del array
 */
function removeOldTravels(
  updatedTravels: I_Travel[],
  currentTravels: I_Travel[],
  newTravels: I_Travel[]
): I_Travel[] {
  const travelsToRemove = currentTravels.filter(
    (currentTravel: I_Travel) =>
      !newTravels.some(
        (newTravel: I_Travel) => newTravel.id === currentTravel.id
      )
  );

  travelsToRemove.forEach((travelToRemove: I_Travel) => {
    const index = updatedTravels.findIndex(
      (travel) => travel.id === travelToRemove.id
    );
    if (index !== -1) {
      updatedTravels.splice(index, 1);
    }
  });
  return updatedTravels;
}

/**
 * filtrar viajes por fecha
 */
function filterTravelsByDate(
  updatedTravels: I_Travel[],
  filterTypes: string[],
  currentDate: Date,
  tomorrowDate: Date,
  nextWeekDate: Date
): I_Travel[] {
  return updatedTravels.filter((travel: I_Travel) => {
    const travelDate = new Date(travel.date_started ?? 0);
    const travelDateOnly = new Date(
      travelDate.getFullYear(),
      travelDate.getMonth(),
      travelDate.getDate()
    );
    const currentDateOnly = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const tomorrowDateOnly = new Date(
      tomorrowDate.getFullYear(),
      tomorrowDate.getMonth(),
      tomorrowDate.getDate()
    );
    const nextWeekDateOnly = new Date(
      nextWeekDate.getFullYear(),
      nextWeekDate.getMonth(),
      nextWeekDate.getDate()
    );

    if (filterTypes.includes('expired') && travelDateOnly < currentDateOnly) {
      return true;
    }
    if (
      filterTypes.includes('today') &&
      travelDateOnly.getTime() === currentDateOnly.getTime()
    ) {
      return true;
    }
    if (
      filterTypes.includes('tomorrow') &&
      travelDateOnly.getTime() === tomorrowDateOnly.getTime()
    ) {
      return true;
    }
    if (
      filterTypes.includes('next7') &&
      travelDateOnly.getTime() > tomorrowDateOnly.getTime() &&
      travelDateOnly.getTime() <= nextWeekDateOnly.getTime()
    ) {
      return true;
    }
    if (
      filterTypes.includes('later') &&
      travelDateOnly.getTime() > nextWeekDateOnly.getTime()
    ) {
      return true;
    }
    return false;
  });
}

/**
 * ordenar array por fecha
 */
function orderBy(travels: I_Travel[]): I_Travel[] {
  return travels.sort((a, b) => {
    const aValue = a.date_started ? a.date_started : 0;
    const bValue = b.date_started ? b.date_started : 0;
    if (aValue < bValue) {
      return -1;
    }
    if (aValue > bValue) {
      return 1;
    }
    return 0;
  });
}



function filterTravels(travels: I_Travel[], offers: I_Offers[], type: string): I_Travel[] {

  let filteredTravels: I_Travel[] = [];

  if (type === 'withOffers') {
    filteredTravels = travels.filter((travel: I_Travel) => {
      return offers.some((offer: I_Offers) => offer.travel.id === travel.id);
    });
  } else if (type === 'withoutOffers') {
    filteredTravels = travels.filter((travel: I_Travel) => {
      return !offers.some((offer: I_Offers) => offer.travel.id === travel.id);
    });
  }
  return filteredTravels;
}
