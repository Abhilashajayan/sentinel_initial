import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  View,
  TextInput,
  Dimensions,
} from "react-native";
import * as Contacts from "expo-contacts";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector, useDispatch } from "react-redux";
import { editUser } from "../axios/axiosConfig";

const handleAddEmergencyContact = async (phoneNumber, contactName, userId) => {
  const updatedUserData = {
    emergencyContacts: {
      name: contactName,
      phone: phoneNumber.toString(),
    },
  };
  // console.log('emregeennnnn',updatedUserData);
  const res = await editUser(userId, updatedUserData);
  console.log("this is response ", res);
};

const PhoneNumberItem = React.memo(
  ({ item: phoneNumber, contactName: contactName, userId: userId }) => (
    <View style={styles.phoneNumberContainer}>
      <Text style={styles.phoneNumber}>{phoneNumber}</Text>
      <TouchableOpacity
        onPress={() => {
          handleAddEmergencyContact(phoneNumber, contactName, userId);
        }}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  )
); //add contacts

const ContactItem = React.memo(({ item, userId }) => (
  <TouchableOpacity style={styles.contactItem}>
    <Text style={styles.contactName}>{item.name}</Text>
    {item.phoneNumbers && (
      <FlatList
        data={item.phoneNumbers}
        keyExtractor={(phoneNumber) => phoneNumber.id}
        renderItem={({ item: phoneNumber }) => (
          <PhoneNumberItem
            item={phoneNumber.number}
            contactName={item.name}
            userId={userId}
          />
        )}
      />
    )}
  </TouchableOpacity>
));

export default function AddContacts() {
  const userId = useSelector((state) => state?.auth.user?._id);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({});

      // Filter out contacts without phone numbers
      const contactsWithNumbers = data.filter(
        (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
      );

      // Sort contacts alphabetically
      const sortedContacts = contactsWithNumbers.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setContacts(sortedContacts);
    } else {
      console.log("Contacts permission denied");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredContacts = () => {
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.phoneNumbers &&
          contact.phoneNumbers.some((phoneNumber) =>
            phoneNumber.number.includes(searchQuery)
          ))
    );
  };

  const groupedContacts = () => {
    const groupedContacts = {};
    filteredContacts().forEach((contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (groupedContacts[firstLetter]) {
        groupedContacts[firstLetter].push(contact);
      } else {
        groupedContacts[firstLetter] = [contact];
      }
    });
    return groupedContacts;
  };

  const renderContactItem = ({ item }) => (
    <ContactItem item={item} userId={userId} />
  );

  const renderGroupedContacts = () => {
    const groupedContactsData = Object.keys(groupedContacts()).map(
      (letter) => ({
        title: letter,
        data: groupedContacts()[letter],
      })
    );

    return (
      <FlatList
        data={groupedContactsData}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View key={item.title}>
            <Text style={styles.groupTitle}>{item.title}</Text>
            <FlatList
              data={item.data}
              keyExtractor={(item) => item.id}
              renderItem={renderContactItem}
            />
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select an Emergency Contact</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search contacts..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <View style={[styles.phoneNumberContainer, styles.phoneNumberContainer1]}>
        <View style={styles.nameAndNumber}>
          <Text style={styles.contactName}>Abhilash</Text>
          <Text style={styles.phoneNumber}>+91 6238691742</Text>
        </View>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
      {renderGroupedContacts()}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  removeButtonText: {
    fontSize: 14,
    padding: 6,
    color: "rgb(100,100,100)",
    backgroundColor: "rgb(215, 215, 215)",
    borderRadius: 10,
  },

  title: {
    fontSize: 35,
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    marginBottom: 10,
    backgroundColor: "rgb( 230, 230, 230 )",
    paddingHorizontal: 10,
    fontSize: 16,
    height: 50,
    borderRadius: 10,
  },
  contactItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgb(235, 235, 235)",
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  phoneNumberContainer: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
  justifyContent: 'space-between',
  },
  phoneNumberContainer1: {
    backgroundColor: "rgb(235, 235, 235)",
    height: 100,
    padding: 20,
    borderRadius: 10,
  },
  phoneNumber: {
    fontSize: 16,
    flex: 1,
    color: "#333",
  },
  groupTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 14,
    padding: 6,
    color: "rgb(100,100,100)",
    backgroundColor: "rgb(215, 215, 215)",
    borderRadius: 10,
  },
});
