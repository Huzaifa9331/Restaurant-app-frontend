// src/components/MenuItemCard.jsx  (customer side)
import { Pressable, Text, View } from 'react-native';
import Button from './Button';

export default function MenuItemCard({ item, onPress, onAdd }) {
  const soldOut = item.isAvailable === false;
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      className={`mx-4 mb-3 rounded-2xl border border-stone-200 bg-white p-4 ${soldOut ? 'opacity-60' : ''}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-lg font-semibold text-stone-900">{item.name}</Text>
          <Text className="mt-0.5 text-sm text-stone-500">{item.category}</Text>
        </View>
        <Text className="text-lg font-bold text-[#1F4D3A]">Rs {item.price}</Text>
      </View>

      {item.description ? (
        <Text numberOfLines={2} className="mt-2 text-stone-600">{item.description}</Text>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between">
        {soldOut ? (
          <Text className="font-medium text-red-600">Sold out</Text>
        ) : (
          <Text className="font-medium text-emerald-700">Available</Text>
        )}
        {onAdd && !soldOut ? (
          <Button title="Add to order" onPress={() => onAdd(item)} className="h-10 px-4" />
        ) : null}
      </View>
    </Pressable>
  );
}
