import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import tw from "twrnc";
import { useDispatch, useSelector } from "react-redux";
import MapViewDirections from "react-native-maps-directions";

import {
  selectDestination,
  selectOrigin,
  setTravelTimeInformation,
} from "../slices/navSlice";
import { GOOGLE_MAPS_APIKEY } from "@env";

const Map = () => {
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const mapRef = useRef(null);
  const dispatch = useDispatch(setTravelTimeInformation);

  useEffect(() => {
    if (!origin || !destination || !mapRef.current) return;

    setTimeout(() => {
      mapRef.current?.fitToSuppliedMarkers(["origin", "destination"], {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
      });
    }, 1000); // Delay for smooth animation
  }, [origin, destination, mapRef.current]);

  useEffect(() => {
    if (!origin || !destination || !GOOGLE_MAPS_APIKEY) return;

    const getTravelTime = async () => {
      try {
        const originCoords = `${origin.location.lat},${origin.location.lng}`;
        const destinationCoords = `${destination.location.lat},${destination.location.lng}`;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationCoords}&origins=${originCoords}&units=imperial&key=${GOOGLE_MAPS_APIKEY}`;

        const data = await fetch(url).then((res) => res.json());

        dispatch(setTravelTimeInformation(data.rows[0].elements[0]));
      } catch (error) {
        console.log("error", error);
      }
    };

    void getTravelTime();
  }, [origin, destination, GOOGLE_MAPS_APIKEY]);

  return (
    <MapView
      ref={mapRef}
      style={tw`flex-1`}
      mapType="mutedStandard"
      initialRegion={{
        latitude: origin.location.lat,
        longitude: origin.location.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
    >
      {origin && destination && (
        <MapViewDirections
          origin={origin.description}
          destination={destination.description}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={3}
          strokeColor="black"
          resetOnChange={false}
        />
      )}
      {origin?.location && (
        <Marker
          key={`${origin.location.lat}-${origin.location.lng}`}
          coordinate={{
            latitude: origin.location.lat,
            longitude: origin.location.lng,
          }}
          title="Origin"
          description={origin.description}
          identifier="origin"
        />
      )}
      {destination?.location && (
        <Marker
          key={`${destination.location.lat}-${destination.location.lng}`}
          coordinate={{
            latitude: destination.location.lat,
            longitude: destination.location.lng,
          }}
          title="Destination"
          description={destination.description}
          identifier="destination"
        />
      )}
    </MapView>
  );
};

export default Map;

const styles = StyleSheet.create({});
