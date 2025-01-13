/// <reference lib="webworker" />

import { I_Offers } from './../../../interface/offers.interface';

// Escuchar mensajes desde el hilo principal
addEventListener('message', ({ data }) => {
  /**
   * @params currentOffers: I_Offers[] => Ofertas actuales
   * @params newOffers: I_Offers[] => Nuevas ofertas
   * @params filterTypes: string[] => tipo de filtro Ex. ['today', 'tomorrow']
   * @params functionType: string => tipo de funcion que ejecuta
   */
  const { functionType, currentOffers, newOffers, filterTypes } = data;

  const currentDate = new Date();
  const tomorrowDate = new Date(currentDate);
  tomorrowDate.setDate(currentDate.getDate() + 1);
  const nextWeekDate = new Date(currentDate);
  nextWeekDate.setDate(currentDate.getDate() + 7);

  // Filtrar ofertas: agregar nuevas y eliminar las que ya no están
  let updatedOffers = [...currentOffers];

  switch (functionType) {
    case 'byDate':
      updatedOffers = filterOffersByDate(
        updatedOffers,
        filterTypes,
        currentDate,
        tomorrowDate,
        nextWeekDate
      );

      break;
    case 'byOrder':
      // Ordenar las ofertas según el campo especificado
      updatedOffers = orderBy(updatedOffers);

      break;
    case 'refresh':
      // Eliminar ofertas que ya no están
      updatedOffers = removeOldOffers(updatedOffers, currentOffers, newOffers);

      // Agregar nuevas ofertas
      updatedOffers = addNewOffers(updatedOffers, newOffers);

      break;

    default:
      break;
  }

  // Enviar el resultado de vuelta al hilo principal
  postMessage({ updatedOffers, filterTypes, functionType });
});

/**
 * Agregar ofertas nuevas al array
 */
function addNewOffers(
  updatedOffers: I_Offers[],
  newOffers: I_Offers[]
): I_Offers[] {
  newOffers.forEach((newOffer: I_Offers) => {
    const existingOfferIndex = updatedOffers.findIndex(
      (offer) => offer.id === newOffer.id
    );
    if (existingOfferIndex === -1) {
      updatedOffers.push(newOffer);
    } else {
      // Actualizar la oferta existente si es necesario
      updatedOffers[existingOfferIndex] = {
        ...updatedOffers[existingOfferIndex],
        ...newOffer,
      };
    }
  });
  return updatedOffers;
}

/**
 * Remover ofertas eliminadas del array
 */
function removeOldOffers(
  updatedOffers: I_Offers[],
  currentOffers: I_Offers[],
  newOffers: I_Offers[]
): I_Offers[] {
  const offersToRemove = currentOffers.filter(
    (currentOffer: I_Offers) =>
      !newOffers.some((newOffer: I_Offers) => newOffer.id === currentOffer.id)
  );

  offersToRemove.forEach((offerToRemove: I_Offers) => {
    const index = updatedOffers.findIndex(
      (offer) => offer.id === offerToRemove.id
    );
    if (index !== -1) {
      updatedOffers.splice(index, 1);
    }
  });
  return updatedOffers;
}

/**
 * filtrar ofertas por Fecha o Tiempo
 */
function filterOffersByDate(
  updatedOffers: I_Offers[],
  filterTypes: string[],
  currentDate: Date,
  tomorrowDate: Date,
  nextWeekDate: Date
): I_Offers[] {
  return updatedOffers.filter((offer: I_Offers) => {
    const offerDate = new Date(offer.travel.date_started ?? 0);
    const offerDateOnly = new Date(
      offerDate.getFullYear(),
      offerDate.getMonth(),
      offerDate.getDate()
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

    if (
      filterTypes.includes('expired') &&
      offerDateOnly.getTime() < currentDateOnly.getTime()
    ) {
      return true;
    }
    if (
      filterTypes.includes('today') &&
      offerDateOnly.getTime() === currentDateOnly.getTime()
    ) {
      return true;
    }
    if (
      filterTypes.includes('tomorrow') &&
      offerDateOnly.getTime() === tomorrowDateOnly.getTime()
    ) {
      return true;
    }
    if (
      filterTypes.includes('next7') &&
      offerDateOnly.getTime() > tomorrowDateOnly.getTime() &&
      offerDateOnly.getTime() <= nextWeekDateOnly.getTime()
    ) {
      return true;
    }
    if (
      filterTypes.includes('later') &&
      offerDateOnly.getTime() > nextWeekDateOnly.getTime()
    ) {
      return true;
    }
    return false;
  });
}

function orderBy(offers: I_Offers[]): I_Offers[] {
  return offers.sort((a, b) => {
    const aValue = a.travel.date_started;
    const bValue = b.travel.date_started;
    if (aValue < bValue) {
      return -1;
    }
    if (aValue > bValue) {
      return 1;
    }
    return 0;
  });
}
