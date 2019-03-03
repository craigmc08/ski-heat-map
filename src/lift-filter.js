/*

Strategy:
find velocity (mag and heading) for each gps point
make array of this

find acceleration of each gps point

for accelerations that are less than a certain threshold, mark these points as lifts
for points that are surrounded on both sides within some threshold of time by lift points,
mark these as lifts

done

*/