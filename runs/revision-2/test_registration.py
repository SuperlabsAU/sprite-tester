import unittest
from PIL import Image
from registration import hip_anchor, translate, register_set

class RegistrationTests(unittest.TestCase):
    def test_waving_hand_does_not_move_hip_anchor(self):
        im=Image.new('RGBA',(64,64))
        for y in range(30,50):
            for x in range(25,36): im.putpixel((x,y),(40,90,150,255))
        before=hip_anchor(im)
        for x in range(2,24): im.putpixel((x,15),(220,160,100,255))
        for x in range(20,30): im.putpixel((x,10),(10,18,24,255))
        self.assertEqual(hip_anchor(im),before)

    def test_translation_refuses_to_clip_opaque_art(self):
        im=Image.new('RGBA',(64,64)); im.putpixel((3,30),(255,0,0,255))
        with self.assertRaises(ValueError): translate(im,-5,0)

    def test_all_delivered_jumps_clear_the_floor_and_peak_at_apex(self):
        for skill in 'ab':
            for view in ['platform','street','isometric','rpg']:
                records=register_set(skill,view)
                cell=128 if view=='street' else 64
                self.assertTrue(all(abs(r['hip_x']-cell/2)<=.5 for r in records))
                jump=[r for r in records if r['action']=='jump']
                self.assertEqual([jump[i]['sole_y'] for i in [0,1,5]],[cell-6]*3)
                self.assertTrue(all(jump[i]['sole_y']<cell-6 for i in [2,3,4]))
                self.assertLess(jump[3]['hip_y'],jump[2]['hip_y'])
                self.assertLess(jump[3]['hip_y'],jump[4]['hip_y'])

if __name__=='__main__': unittest.main()
